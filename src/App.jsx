import React, { useState } from 'react';
import Papa from 'papaparse';
import { Package, ArrowDownLeft, ArrowUpRight, RefreshCw, Upload, Search, Filter, AlertTriangle, Layers, UserCheck, Plus, Edit, Camera, Trash2, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalogo');
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Módulos de registro multi-producto
  const [tipoMovimiento, setTipoMovimiento] = useState('salida'); // entrada, salida, ajuste, traspaso
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [motivoAjuste, setMotivoAjuste] = useState('Ajuste por Auditoría');
  const [carrito, setCarrito] = useState([]);

  // Carga inicial
  const [productos, setProductos] = useState([
    { codigo: '001', nombre: 'Baygon casa y jardín', cat: 'Limpieza', unidad: 'Pza', stock: 25, min: 10, sku: '7501032907570' },
    { codigo: '002', nombre: 'End Bac spray desinfectante', cat: 'Limpieza', unidad: 'Pza', stock: 12, min: 5, sku: '807174547214' },
    { codigo: '003', nombre: 'FamilyGuard', cat: 'Limpieza', unidad: 'Pza', stock: 52, min: 10, sku: '7501032919177' }
  ]);

  const personal = [
    { id: '0025', nombre: 'Barrera Limon Angeles', depto: 'Limpieza' },
    { id: '0076', nombre: 'Fabian Huerta Diana Laura', depto: 'Limpieza' },
    { id: '0024', nombre: 'Flores Gonzalez Margarita', depto: 'Limpieza' },
    { id: '0737', nombre: 'Guerrero Meza Joel', depto: 'Limpieza' },
    { id: '0803', nombre: 'Aguilar Romero Hector Gerardo', depto: 'Supervisor' }
  ];

  const [historialMovimientos, setHistorialMovimientos] = useState([]);

  // Cargar CSV completo de Google Sheets
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data.map((row, idx) => ({
            codigo: row['Código'] || row['Codigo'] || `COD-${idx+1}`,
            nombre: row['Nombre del Producto'] || row['Producto'] || 'Sin nombre',
            cat: row['Categoria'] || row['Categoría'] || 'General',
            unidad: row['Unidad'] || 'Pza',
            stock: parseInt(row['Stock Inicial'] || row['Stock'] || 0),
            min: parseInt(row['Stock Minimo'] || row['Stock Mínimo'] || 5),
            sku: row['SKU'] || row['Código'] || ''
          }));
          setProductos(parsed);
          if (parsed.length > 0) setSelectedProduct(parsed[0]);
        }
      });
    }
  };

  // Agregar al carrito multi-producto
  const agregarAlCarrito = (prod) => {
    const existe = carrito.find(item => item.sku === prod.sku);
    if (existe) {
      setCarrito(carrito.map(item => item.sku === prod.sku ? { ...item, cant: item.cant + 1 } : item));
    } else {
      setCarrito([...carrito, { ...prod, cant: 1 }]);
    }
  };

  const procesarRegistro = () => {
    if (carrito.length === 0) return alert('Agrega al menos un producto');
    
    // Actualizar stock de productos
    const nuevosProductos = productos.map(p => {
      const itemCarrito = carrito.find(c => c.sku === p.sku);
      if (itemCarrito) {
        let delta = itemCarrito.cant;
        if (tipoMovimiento === 'salida' || tipoMovimiento === 'ajuste') delta = -delta;
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    });

    setProductos(nuevosProductos);
    setHistorialMovimientos([
      {
        id: Date.now(),
        tipo: tipoMovimiento,
        items: carrito.length,
        detalles: carrito.map(c => `${c.nombre} (${c.cant})`).join(', '),
        responsable: empleadoSeleccionado || motivoAjuste,
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...historialMovimientos
    ]);

    setCarrito([]);
    alert('¡Registro guardado correctamente!');
  };

  const guardarEdicionProducto = (e) => {
    e.preventDefault();
    setProductos(productos.map(p => p.sku === editingProduct.sku ? editingProduct : p));
    setSelectedProduct(editingProduct);
    setEditingProduct(null);
  };

  const filteredProducts = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col p-6 justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/30">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">Almacén iPad</h1>
              <span className="text-xs text-slate-400">Control Interactivo</span>
            </div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('catalogo')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition ${activeTab === 'catalogo' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Layers size={20} /> Catálogo ({productos.length})
            </button>
            <button 
              onClick={() => setActiveTab('movimiento')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition ${activeTab === 'movimiento' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <ArrowUpRight size={20} /> Registrar Entrada / Salida
            </button>
            <button 
              onClick={() => setActiveTab('historial')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition ${activeTab === 'historial' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Filter size={20} /> Historial Filtrable
            </button>
          </nav>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <label className="text-xs text-slate-300 font-semibold mb-2 block flex items-center gap-2">
            <Upload size={14} /> Cargar todo el CSV de Sheets
          </label>
          <input 
            type="file" 
            accept=".csv"
            onChange={handleFileUpload}
            className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer w-full"
          />
        </div>
      </aside>

      {/* Area Principal */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por Nombre, SKU o Código..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border">
            <UserCheck size={16} className="text-green-600" /> Operador / Supervisor
          </div>
        </header>

        {/* MÓDULO 1: CATÁLOGO */}
        {activeTab === 'catalogo' && (
          <div className="flex-1 flex overflow-hidden p-6 gap-6">
            <div className="w-1/2 overflow-y-auto space-y-3 pr-2">
              {filteredProducts.map(p => (
                <div 
                  key={p.sku + p.codigo} 
                  onClick={() => setSelectedProduct(p)}
                  className={`p-4 rounded-2xl bg-white border transition cursor-pointer flex justify-between items-center ${selectedProduct?.sku === p.sku ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div>
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Cód: {p.codigo}</span>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">SKU: {p.sku}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 mt-1.5">{p.nombre}</h3>
                    <span className="text-xs text-slate-400">{p.cat} • {p.unidad}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black ${p.stock <= p.min ? 'text-red-500' : 'text-slate-800'}`}>
                      {p.stock} <span className="text-xs text-slate-400 font-normal">{p.unidad}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Ficha / Edición */}
            <div className="w-1/2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm overflow-y-auto">
              {selectedProduct ? (
                <div>
                  <div className="flex justify-between items-start mb-6 border-b pb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">SKU: {selectedProduct.sku}</span>
                      <h2 className="text-2xl font-black text-slate-900 mt-2">{selectedProduct.nombre}</h2>
                      <p className="text-sm text-slate-500">{selectedProduct.cat} • {selectedProduct.unidad}</p>
                    </div>
                    <button 
                      onClick={() => setEditingProduct(selectedProduct)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border">
                      <Edit size={14} /> Editar
                    </button>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-sm text-slate-700 mb-2">Fotografía del Producto</h4>
                    <div className="w-full h-36 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Camera size={24} />
                      <span className="text-xs">Tomar o subir foto desde iPad</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border mb-6 flex justify-around text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock Actual</span>
                      <span className="text-2xl font-black text-slate-800">{selectedProduct.stock}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock Mínimo</span>
                      <span className="text-2xl font-black text-slate-800">{selectedProduct.min}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Selecciona un producto</div>
              )}
            </div>
          </div>
        )}

        {/* MÓDULO 2: REGISTRO DE ENTRADAS / SALIDAS */}
        {activeTab === 'movimiento' && (
          <div className="flex-1 flex p-6 gap-6 overflow-hidden">
            {/* Lista Selección (Izquierda) */}
            <div className="w-1/2 overflow-y-auto space-y-2 pr-2">
              <h3 className="font-bold text-sm text-slate-700 mb-2">Selecciona productos para el registro:</h3>
              {filteredProducts.map(p => (
                <div key={p.sku} className="p-3 bg-white rounded-xl border flex justify-between items-center hover:border-blue-400">
                  <div>
                    <p className="font-bold text-sm">{p.nombre}</p>
                    <span className="text-xs text-slate-400">Stock: {p.stock} {p.unidad}</span>
                  </div>
                  <button 
                    onClick={() => agregarAlCarrito(p)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition">
                    + Agregar
                  </button>
                </div>
              ))}
            </div>

            {/* Carrito y Datos de Registro (Derecha) */}
            <div className="w-1/2 bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-lg mb-4">Detalles del Movimiento</h3>
                
                {/* Tipo de movimiento */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button onClick={() => setTipoMovimiento('salida')} className={`p-2 rounded-xl text-xs font-bold border ${tipoMovimiento === 'salida' ? 'bg-blue-600 text-white' : 'bg-slate-50'}`}>Salida a Compañero</button>
                  <button onClick={() => setTipoMovimiento('entrada')} className={`p-2 rounded-xl text-xs font-bold border ${tipoMovimiento === 'entrada' ? 'bg-green-600 text-white' : 'bg-slate-50'}`}>Entrada por Compra</button>
                  <button onClick={() => setTipoMovimiento('ajuste')} className={`p-2 rounded-xl text-xs font-bold border ${tipoMovimiento === 'ajuste' ? 'bg-amber-600 text-white' : 'bg-slate-50'}`}>Ajuste Auditoría</button>
                </div>

                {/* Selección de Compañero o Leyenda */}
                {tipoMovimiento === 'salida' && (
                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-600 block mb-1">Compañero que recibe:</label>
                    <select 
                      value={empleadoSeleccionado} 
                      onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-medium">
                      <option value="">Selecciona empleado...</option>
                      {personal.map(e => <option key={e.id} value={e.nombre}>{e.nombre} ({e.depto})</option>)}
                    </select>
                  </div>
                )}

                {/* Carrito de Productos */}
                <h4 className="font-bold text-xs text-slate-500 mb-2 uppercase">Productos Seleccionados ({carrito.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {carrito.map(item => (
                    <div key={item.sku} className="p-2.5 bg-slate-50 rounded-xl border flex justify-between items-center text-sm">
                      <span className="font-bold truncate max-w-[180px]">{item.nombre}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold bg-white px-2 py-0.5 rounded border">{item.cant}</span>
                        <button onClick={() => setCarrito(carrito.filter(c => c.sku !== item.sku))} className="text-red-500"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={procesarRegistro}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Confirmar y Guardar Registro
              </button>
            </div>
          </div>
        )}

        {/* MÓDULO 3: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="p-6 overflow-y-auto flex-1">
            <h2 className="text-2xl font-bold mb-4">Bitácora de Movimientos</h2>
            <div className="bg-white rounded-2xl border divide-y shadow-sm">
              {historialMovimientos.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Aún no hay registros guardados en esta sesión.</div>
              ) : (
                historialMovimientos.map(h => (
                  <div key={h.id} className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm uppercase text-slate-700">{h.tipo} - {h.responsable}</h4>
                      <p className="text-xs text-slate-500">{h.detalles} • {h.fecha}</p>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full border">{h.items} ítems</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Editar Producto */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={guardarEdicionProducto} className="bg-white rounded-2xl p-6 w-96 shadow-2xl border space-y-4">
            <h3 className="font-bold text-lg">Editar Producto</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Nombre</label>
              <input type="text" value={editingProduct.nombre} onChange={e => setEditingProduct({...editingProduct, nombre: e.target.value})} className="w-full p-2 border rounded-xl text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Stock Actual</label>
                <input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} className="w-full p-2 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Stock Mínimo</label>
                <input type="number" value={editingProduct.min} onChange={e => setEditingProduct({...editingProduct, min: parseInt(e.target.value)})} className="w-full p-2 border rounded-xl text-sm" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingProduct(null)} className="w-1/2 py-2 border rounded-xl font-bold text-xs">Cancelar</button>
              <button type="submit" className="w-1/2 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
