"use strict";

class Inventory {
    constructor() {
        this.items = [];
        this.load();
    }
    save() { localStorage.setItem('inventory_items', JSON.stringify(this.items)); }
    load() {
        const raw = localStorage.getItem('inventory_items');
        if (raw) {
            try {
                this.items = JSON.parse(raw);
            }
            catch (_a) {
                this.items = [];
            }
        }
    }


    generateId() { return Date.now() + Math.floor(Math.random() * 1000); }
    validateItem(item) {
        if (!item.name || item.name.trim() === '')
            return { ok: false, message: 'Name is required.' };
        if (!item.category || item.category.trim() === '')
            return { ok: false, message: 'Category is required.' };
        if (item.quantity == null || item.quantity < 0 || !Number.isFinite(item.quantity))
            return { ok: false, message: 'Quantity must be a non-negative number.' };
        if (item.price == null || item.price < 0 || !Number.isFinite(item.price))
            return { ok: false, message: 'Price must be a non-negative number.' };
        if (!item.supplier || item.supplier.trim() === '')
            return { ok: false, message: 'Supplier is required.' };
        if (!item.stockStatus || item.stockStatus.trim() === '')
            return { ok: false, message: 'Stock status is required.' };
        return { ok: true };
    }


    addItem(itemData) {
        const check = this.validateItem(itemData);
        if (!check.ok)
            return { ok: false, message: check.message };
        const id = this.generateId();
        const item = Object.assign({ id }, itemData);
        this.items.push(item);
        this.save();
        return { ok: true, item };
    }


    updateItem(id, updated) {
        const idx = this.items.findIndex(i => i.id === id);
        if (idx === -1)
            return { ok: false, message: 'Item not found' };
        const merged = Object.assign(Object.assign({}, this.items[idx]), updated);
        const check = this.validateItem(merged);
        if (!check.ok)
            return { ok: false, message: check.message };
        this.items[idx] = merged;
        this.save();
        return { ok: true, item: this.items[idx] };
    }


    deleteItem(id) {
        const idx = this.items.findIndex(i => i.id === id);
        if (idx === -1)
            return { ok: false, message: 'Item not found' };
        this.items.splice(idx, 1);
        this.save();
        return { ok: true };
    }


    searchByName(name) {
        return this.items.filter(i => i.name.toLowerCase().includes(name.toLowerCase()));
    }


    getAll() { return [...this.items]; }
    getPopular() { return this.items.filter(i => i.isPopular); }
}


// UI wiring
const inventory = new Inventory();
function qs(id) { return document.getElementById(id); }
let editingId = null;
function formatCurrency(v) { return `$${v.toFixed(2)}`; }


function renderList(items) {
    const container = qs('list');

    if (!container)
        return;
    container.innerHTML = '';

    if (items.length === 0) {
        container.textContent = 'No items.';
        return;
    }
    const ul = document.createElement('ul');


    for (const it of items) {
        const li = document.createElement('li');
        const title = document.createElement('span');
        title.textContent = `${it.name} — ${it.category} — ${it.quantity} pcs — ${formatCurrency(it.price)}`;
        li.appendChild(title);
        const edit = document.createElement('button');
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => fillFormForEdit(it.id));
        li.appendChild(edit);
        const del = document.createElement('button');
        del.textContent = 'Delete';
        del.addEventListener('click', () => {
            if (confirm(`Delete "${it.name}"?`)) {
                inventory.deleteItem(it.id);
                renderList(inventory.getAll());
            }
        });


        li.appendChild(del);
        ul.appendChild(li);


    }
    container.appendChild(ul);


}



function fillFormForEdit(id) {
    const item = inventory.getAll().find(i => i.id === id);
    if (!item)
        return;
    editingId = id;
    (qs('name')).value = item.name;
    (qs('category')).value = item.category;
    (qs('quantity')).value = String(item.quantity);
    (qs('price')).value = String(item.price);
    (qs('supplier')).value = item.supplier;
    (qs('stockStatus')).value = item.stockStatus;
    (qs('isPopular')).checked = item.isPopular;
    (qs('comment')).value = item.comment || '';
    qs('submit').textContent = 'Update Item';
}



function clearForm() {
    editingId = null;
    (qs('name')).value = '';
    (qs('category')).value = '';
    (qs('quantity')).value = '0';
    (qs('price')).value = '0';
    (qs('supplier')).value = '';
    (qs('stockStatus')).value = '';
    (qs('isPopular')).checked = false;
    (qs('comment')).value = '';
    qs('submit').textContent = 'Add Item';
}



function readForm() {
    return {
        name: (qs('name')).value.trim(),
        category: (qs('category')).value.trim(),
        quantity: Number((qs('quantity')).value) || 0,
        price: Number((qs('price')).value) || 0,
        supplier: (qs('supplier')).value.trim(),
        stockStatus: (qs('stockStatus')).value.trim(),
        isPopular: (qs('isPopular')).checked,
        comment: (qs('comment')).value.trim() || undefined
    };
}


function showMessage(msg, isError = false) {
    const m = qs('message');
    if (!m)
        return;
    m.textContent = msg;
    m.style.color = isError ? 'crimson' : 'green';
    setTimeout(() => { m.textContent = ''; }, 3000);
}


function wire() {
    qs('form').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const data = readForm();
        if (editingId) {
            const res = inventory.updateItem(editingId, data);
            if (!res.ok) {
                showMessage(String(res.message || 'Error'), true);
                return;
            }
            showMessage('Item updated');
        }
        else {
            const res = inventory.addItem(data);
            if (!res.ok) {
                showMessage(String(res.message || 'Error'), true);
                return;
            }
            showMessage('Item added');
        }
        clearForm();
        renderList(inventory.getAll());
    });
    qs('q').addEventListener('input', (ev) => {
        const v = ev.target.value;
        if (v.trim() === '')
            renderList(inventory.getAll());
        else
            renderList(inventory.searchByName(v));
    });
    qs('showPopular').addEventListener('click', () => renderList(inventory.getPopular()));
    qs('showAll').addEventListener('click', () => renderList(inventory.getAll()));
    renderList(inventory.getAll());
}


document.addEventListener('DOMContentLoaded', wire);
