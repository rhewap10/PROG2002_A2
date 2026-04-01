interface Item {
    id: number;
    name: string;
    category: string;
    quantity: number;
    price: number;
    supplier: string;
    stockStatus: string;
    isPopular: boolean;
    comment?: string;
}



class Inventory {
    private items: Item[] = [];
    constructor() { this.load(); }

    private save() { localStorage.setItem('inventory_items', JSON.stringify(this.items)); }
    private load() {
        const raw = localStorage.getItem('inventory_items');
        if (raw) {
            try { this.items = JSON.parse(raw); } catch { this.items = []; }
        }
    }


    
    private generateId(): number { return Date.now() + Math.floor(Math.random() * 1000); }

    validateItem(item: Partial<Item>): { ok: boolean; message?: string } {
        if (!item.name || item.name.trim() === '') return { ok: false, message: 'Name is required.' };
        if (!item.category || item.category.trim() === '') return { ok: false, message: 'Category is required.' };
        if (item.quantity == null || item.quantity < 0 || !Number.isFinite(item.quantity)) return { ok: false, message: 'Quantity must be a non-negative number.' };
        if (item.price == null || item.price < 0 || !Number.isFinite(item.price)) return { ok: false, message: 'Price must be a non-negative number.' };
        if (!item.supplier || item.supplier.trim() === '') return { ok: false, message: 'Supplier is required.' };
        if (!item.stockStatus || item.stockStatus.trim() === '') return { ok: false, message: 'Stock status is required.' };
        return { ok: true };
    }

    addItem(itemData: Omit<Item, 'id'>) {
        const check = this.validateItem(itemData);
        if (!check.ok) return { ok: false, message: check.message };
        const id = this.generateId();
        const item: Item = { id, ...itemData };
        this.items.push(item);
        this.save();
        return { ok: true, item };
    }

    updateItem(id: number, updated: Partial<Item>) {
        const idx = this.items.findIndex(i => i.id === id);
        if (idx === -1) return { ok: false, message: 'Item not found' };
        const merged = { ...this.items[idx], ...updated };
        const check = this.validateItem(merged);
        if (!check.ok) return { ok: false, message: check.message };
        this.items[idx] = merged as Item;
        this.save();
        return { ok: true, item: this.items[idx] };
    }

    deleteItem(id: number) {
        const idx = this.items.findIndex(i => i.id === id);
        if (idx === -1) return { ok: false, message: 'Item not found' };
        this.items.splice(idx, 1);
        this.save();
        return { ok: true };
    }

    searchByName(name: string) {
        return this.items.filter(i => i.name.toLowerCase().includes(name.toLowerCase()));
    }

    getAll() { return [...this.items]; }
    getPopular() { return this.items.filter(i => i.isPopular); }
}

// UI wiring
const inventory = new Inventory();

function qs<T extends HTMLElement>(id: string) { return document.getElementById(id) as T | null; }

let editingId: number | null = null;

function formatCurrency(v: number) { return `$${v.toFixed(2)}`; }

function renderList(items: Item[]) {
    const container = qs<HTMLDivElement>('list');
    if (!container) return;
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

function fillFormForEdit(id: number) {
    const item = inventory.getAll().find(i => i.id === id);
    if (!item) return;
    editingId = id;
    (qs<HTMLInputElement>('name')!).value = item.name;
    (qs<HTMLInputElement>('category')!).value = item.category;
    (qs<HTMLInputElement>('quantity')!).value = String(item.quantity);
    (qs<HTMLInputElement>('price')!).value = String(item.price);
    (qs<HTMLInputElement>('supplier')!).value = item.supplier;
    (qs<HTMLInputElement>('stockStatus')!).value = item.stockStatus;
    (qs<HTMLInputElement>('isPopular')!).checked = item.isPopular;
    (qs<HTMLInputElement>('comment')!).value = item.comment || '';
    qs<HTMLButtonElement>('submit')!.textContent = 'Update Item';
}

function clearForm() {
    editingId = null;
    (qs<HTMLInputElement>('name')!).value = '';
    (qs<HTMLInputElement>('category')!).value = '';
    (qs<HTMLInputElement>('quantity')!).value = '0';
    (qs<HTMLInputElement>('price')!).value = '0';
    (qs<HTMLInputElement>('supplier')!).value = '';
    (qs<HTMLInputElement>('stockStatus')!).value = '';
    (qs<HTMLInputElement>('isPopular')!).checked = false;
    (qs<HTMLInputElement>('comment')!).value = '';
    qs<HTMLButtonElement>('submit')!.textContent = 'Add Item';
}

function readForm(): Partial<Item> {
    return {
        name: (qs<HTMLInputElement>('name')!).value.trim(),
        category: (qs<HTMLInputElement>('category')!).value.trim(),
        quantity: Number((qs<HTMLInputElement>('quantity')!).value) || 0,
        price: Number((qs<HTMLInputElement>('price')!).value) || 0,
        supplier: (qs<HTMLInputElement>('supplier')!).value.trim(),
        stockStatus: (qs<HTMLInputElement>('stockStatus')!).value.trim(),
        isPopular: (qs<HTMLInputElement>('isPopular')!).checked,
        comment: (qs<HTMLInputElement>('comment')!).value.trim() || undefined
    };
}

function showMessage(msg: string, isError = false) {
    const m = qs<HTMLDivElement>('message');
    if (!m) return;
    m.textContent = msg;
    m.style.color = isError ? 'crimson' : 'green';
    setTimeout(() => { m.textContent = ''; }, 3000);
}

function wire() {
    qs<HTMLFormElement>('form')!.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const data = readForm();
        if (editingId) {
            const res = inventory.updateItem(editingId, data);
            if (!res.ok) { showMessage(String(res.message || 'Error'), true); return; }
            showMessage('Item updated');
        } else {
            const res = inventory.addItem(data as Omit<Item, 'id'>);
            if (!res.ok) { showMessage(String(res.message || 'Error'), true); return; }
            showMessage('Item added');
        }
        clearForm();
        renderList(inventory.getAll());
    });

    qs<HTMLInputElement>('q')!.addEventListener('input', (ev) => {
        const v = (ev.target as HTMLInputElement).value;
        if (v.trim() === '') renderList(inventory.getAll()); else renderList(inventory.searchByName(v));
    });

    qs<HTMLButtonElement>('showPopular')!.addEventListener('click', () => renderList(inventory.getPopular()));
    qs<HTMLButtonElement>('showAll')!.addEventListener('click', () => renderList(inventory.getAll()));

    renderList(inventory.getAll());
}

document.addEventListener('DOMContentLoaded', wire);
