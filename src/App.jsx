import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Package, ArrowDownLeft, ArrowUpRight, RefreshCw, Search, Filter, AlertTriangle, Layers, UserCheck, Edit, Camera, Trash2, CheckCircle2, Building2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalogo');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Filtros Avanzados para Historial
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterProducto, setFilterProducto] = useState('todos');
  const [filterResponsable, setFilterResponsable] = useState('todos');

  // Estados desde Supabase
  const [productos, setProductos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [historialMovimientos, setHistorialMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para nuevo registro
  const [tipoMovimiento, setTipoMovimiento] = useState('salida'); // salida, entrada, ajuste, traspaso
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [plantelDestino, setPlantelDestino] = useState('Secundaria');
  const [motivoAjuste, setMotivoAjuste] = useState('Ajuste por Auditoría');
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    setCargando(true);
    
    // 1. Obtener productos
    const { data: dataProds } = await supabase.from('productos').select('*').order('id', { ascending: true });
    if (dataProds) {
      const prodsFormatted = dataProds.map(p => ({
        id: p.id,
        codigo: p.codigo || p.Código || '000',
        nombre: p.nombre || p['Nombre del Producto'] || 'Sin nombre',
        stock: p.stock ?? p['Stock Inicial'] ?? 0,
        min: p.min ?? p['Stock Minimo'] ?? 5,
        sku: p.sku || p.SKU || '',
        cat: p.cat || p.Categoria || p.Categoría || 'Limpieza',
        unidad: p.unidad || p.Unidad || 'Pza'
      }));
      setProductos(prodsFormatted);
      if (prodsFormatted.length > 0 && !selectedProduct) setSelectedProduct(prodsFormatted[0]);
    }

    // 2. Obtener personal
    const { data: dataPersonal } = await supabase.from('personal').select('*');
    if (dataPersonal) setPersonal(dataPersonal);

    // 3. Obtener movimientos
    const { data: dataMovs } = await supabase.from('movimientos').select('*').order('created_at', { ascending: false });
    if (dataMovs) setHistorialMovimientos(dataMovs);

    setCargando(false);
  };

  // Obtener lista única de categorías
  const categoriasUnicas = ['Todas', ...new Set(productos.map(p => p.cat).filter(Boolean))];

  const agregarAlCarrito = (prod) => {
    const existe = carrito.find(item => item.id === prod.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === prod.id ? { ...item, cant: item.cant + 1 } : item));
    } else {
      setCarrito([...carrito, { ...prod, cant: 1 }]);
    }
  };

  const procesarRegistro = async () => {
    if (carrito.length === 0) return alert('Agrega al menos un producto');
    
    let responsableFinal = empleadoSeleccionado;
    if (tipoMovimiento === 'traspaso') responsableFinal = `Traspaso a Plantel ${plantelDestino}`;
    if (tipoMovimiento === 'ajuste') responsableFinal = motivoAjuste;
    if (tipoMovimiento === 'entrada') responsableFinal = 'Entrada por Compra / Proveedor';

    if (tipoMovimiento === 'salida' && !empleadoSeleccionado) return alert('Selecciona al compañero receptor');

    // Actualizar stock en Supabase
    for (const item of carrito) {
      let delta = item.cant;
      if (tipoMovimiento === 'salida' || tipoMovimiento === 'ajuste' || tipoMovimiento === 'traspaso') delta = -delta;
      const nuevoStock = Math.max(0, item.stock + delta);

      await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', item.id);
    }

    // Guardar historial en Supabase
    const resumenDetalles = carrito.map(c => `${c.nombre} (${c.cant} ${c.unidad})`).join(', ');
    await supabase.from('movimientos').insert([
      {
        tipo: tipoMovimiento,
        responsable: responsableFinal,
        detalles: resumenDetalles,
        items_count: carrito.length
      }
    ]);

    setCarrito([]);
    alert('¡Registro y movimiento guardado en Supabase!');
    fetchDatos();
  };

  const guardarEdicionProducto = async (e) => {
    e.preventDefault();
    await supabase
      .from('productos')
      .update({
        nombre: editingProduct.nombre,
        stock: editingProduct.stock,
        min: editingProduct.min,
        cat: editingProduct.cat
      })
      .eq('id', editingProduct.id);

    setEditingProduct(null);
    fetchDatos();
  };

  // Filtrado de Productos por Búsqueda y Categoría
  const filteredProducts = productos.filter(p => {
    const matchSearch = (p.nombre && p.nombre.toLowerCase().includes(searchTerm.toLowerCase())) || 
                        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = selectedCategory === 'Todas' || p.cat === selectedCategory;
    return matchSearch && matchCat;
  });

  // Filtrado Combinado de Movimientos
  const filteredMovimientos = historialMovimientos.filter(h => {
    const matchTipo = filterTipo === 'todos' || h.tipo === filterTipo;
    const matchResp = filterResponsable === 'todos' || (h.responsable && h.responsable.toLowerCase().includes(filterResponsable.toLowerCase()));
    const matchProd = filterProducto === 'todos' || (h.detalles && h.detalles.toLowerCase().includes(filterProducto.toLowerCase()));
    return matchTipo && matchResp && matchProd;
  });

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col p-6 justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/30">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">Almacén iPad</h1>
              <span className="text-xs text-green-400 font-semibold">● En línea (Supabase)</span>
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
              <ArrowUpRight size={20} /> Entradas / Salidas
            </button>
            <button 
              onClick={() => setActiveTab('historial')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition ${activeTab === 'historial' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Filter size={20} /> Historial Filtrable
            </button>
          </nav>
        </div>

        <button 
          onClick={fetchDatos}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2">
          <RefreshCw size={14} /> Sincronizar Datos
        </button>
      </aside>

      {/* Main Container */}
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

        {cargando ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Cargando datos desde Supabase...</div>
        ) : (
          <>
            {/* CATÁLOGO POR CATEGORÍAS */}
            {activeTab === 'catalogo' && (
              <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
                {/* Selector de Categorías */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categoriasUnicas.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex-1 flex overflow-hidden gap-6">
                  {/* Lista de Productos */}
                  <div className="w-1/2 overflow-y-auto space-y-3 pr-2">
                    {filteredProducts.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedProduct(p)}
                        className={`p-4 rounded-2xl bg-white border transition cursor-pointer flex justify-between items-center ${selectedProduct?.id === p.id ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
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
                          {p.stock <= p.min && (
                            <span className="flex items-center justify-end gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mt-1">
                              <AlertTriangle size={10} /> Stock Bajo
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ficha Detalle */}
                  <div className="w-1/2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm overflow-y-auto">
                    {selectedProduct ? (
                      <div>
                        <div className="flex justify-between items-start mb-6 border-b pb-4">
                          <div>
                            <div className="flex gap-2">
                              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">SKU: {selectedProduct.sku}</span>
                              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">Código: {selectedProduct.codigo}</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mt-3">{selectedProduct.nombre}</h2>
                            <p className="text-sm text-slate-500">{selectedProduct.cat} • Unidad: {selectedProduct.unidad}</p>
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
                            <span className="text-xs">Evidencia fotográfica en Supabase</span>
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
              </div>
            )}

            {/* MÓDULO REGISTRO ENTRADA / SALIDA / TRASPASO */}
            {activeTab === 'movimiento' && (
              <div className="flex-1 flex p-6 gap-6 overflow-hidden">
                <div className="w-1/2 overflow-y-auto space-y-2 pr-2">
                  <h3 className="font-bold text-sm text-slate-700 mb-2">Selecciona productos para la transacción:</h3>
                  {filteredProducts.map(p => (
                    <div key={p.id} className="p-3 bg-white rounded-xl border flex justify-between items-center hover:border-blue-400">
                      <div>
                        <p className="font-bold text-sm">{p.nombre}</p>
                        <span className="text-xs text-slate-400">Disponibles: {p.stock} {p.unidad}</span>
                      </div>
                      <button 
                        onClick={() => agregarAlCarrito(p)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition">
                        + Agregar
                      </button>
                    </div>
                  ))}
                </div>

                <div className="w-1/2 bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-lg mb-4">Detalles del Registro</h3>
                    <div className="grid grid-cols-4 gap-1.5 mb-4">
                      <button onClick={() => setTipoMovimiento('salida')} className={`p-2 rounded-xl text-[11px] font-bold border ${tipoMovimiento === 'salida' ? 'bg-blue-600 text-white' : 'bg-slate-50'}`}>Salida Persona</button>
                      <button onClick={() => setTipoMovimiento('traspaso')} className={`p-2 rounded-xl text-[11px] font-bold border ${tipoMovimiento === 'traspaso' ? 'bg-purple-600 text-white' : 'bg-slate-50'}`}>Traspaso Plantel</button>
                      <button onClick={() => setTipoMovimiento('entrada')} className={`p-2 rounded-xl text-[11px] font-bold border ${tipoMovimiento === 'entrada' ? 'bg-green-600 text-white' : 'bg-slate-50'}`}>Entrada Compra</button>
                      <button onClick={() => setTipoMovimiento('ajuste')} className={`p-2 rounded-xl text-[11px] font-bold border ${tipoMovimiento === 'ajuste' ? 'bg-amber-600 text-white' : 'bg-slate-50'}`}>Ajuste Auditoría</button>
                    </div>

                    {tipoMovimiento === 'salida' && (
                      <div className="mb-4">
                        <label className="text-xs font-bold text-slate-600 block mb-1">Compañero receptor:</label>
                        <select 
                          value={empleadoSeleccionado} 
                          onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-medium">
                          <option value="">Selecciona empleado...</option>
                          {personal.map(e => <option key={e.id} value={e.nombre}>{e.nombre} ({e.departamento || e.plantel})</option>)}
                        </select>
                      </div>
                    )}

                    {tipoMovimiento === 'traspaso' && (
                      <div className="mb-4">
                        <label className="text-xs font-bold text-slate-600 block mb-1">Plantel Destino:</label>
                        <select 
                          value={plantelDestino} 
                          onChange={(e) => setPlantelDestino(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-medium">
                          <option value="Secundaria">Plantel Secundaria</option>
                          <option value="Primaria">Plantel Primaria</option>
                          <option value="Preescolar">Plantel Preescolar</option>
                          <option value="General">Plantel General / Central</option>
                        </select>
                      </div>
                    )}

                    <h4 className="font-bold text-xs text-slate-500 mb-2 uppercase">Lista de Selección ({carrito.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                      {carrito.map(item => (
                        <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl border flex justify-between items-center text-sm">
                          <span className="font-bold truncate max-w-[180px]">{item.nombre}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold bg-white px-2 py-0.5 rounded border">{item.cant}</span>
                            <button onClick={() => setCarrito(carrito.filter(c => c.id !== item.id))} className="text-red-500"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={procesarRegistro}
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Confirmar Transacción
                  </button>
                </div>
              </div>
            )}

            {/* MÓDULO HISTORIAL CON FILTROS COMBINADOS */}
            {activeTab === 'historial' && (
              <div className="p-6 overflow-y-auto flex-1">
                <h2 className="text-2xl font-bold mb-4">Bitácora de Movimientos</h2>

                {/* Barra de Filtros Combinables */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 grid grid-cols-3 gap-4 shadow-sm">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Tipo de Movimiento</label>
                    <select 
                      value={filterTipo} 
                      onChange={(e) => setFilterTipo(e.target.value)}
                      className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-semibold">
                      <option value="todos">Todos los tipos</option>
                      <option value="salida">Salidas</option>
                      <option value="traspaso">Traspasos</option>
                      <option value="entrada">Entradas</option>
                      <option value="ajuste">Ajustes</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Filtrar por Producto</label>
                    <select 
                      value={filterProducto} 
                      onChange={(e) => setFilterProducto(e.target.value)}
                      className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-semibold">
                      <option value="todos">Todos los productos</option>
                      {productos.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Filtrar por Receptor / Empleado</label>
                    <select 
                      value={filterResponsable} 
                      onChange={(e) => setFilterResponsable(e.target.value)}
                      className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-semibold">
                      <option value="todos">Todos los empleados</option>
                      {personal.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
                    </select>
                  </div>
                </div>

                {/* Lista de Registros Coincidentes */}
                <div className="bg-white rounded-2xl border divide-y shadow-sm">
                  {filteredMovimientos.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No se encontraron movimientos con los filtros seleccionados.</div>
                  ) : (
                    filteredMovimientos.map(h => (
                      <div key={h.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <div className="flex gap-2 items-center mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                              h.tipo === 'entrada' ? 'bg-green-100 text-green-700' :
                              h.tipo === 'salida' ? 'bg-blue-100 text-blue-700' :
                              h.tipo === 'traspaso' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {h.tipo}
                            </span>
                            <span className="font-bold text-xs text-slate-800">{h.responsable}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">{h.detalles}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">{new Date(h.created_at).toLocaleString()}</span>
                        </div>
                        <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full border">{h.items_count} ítems</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
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
              <button type="submit" className="w-1/2 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs">Guardar en Supabase</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
