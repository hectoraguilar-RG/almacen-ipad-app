import React, { useState } from 'react';
import Papa from 'papaparse';
import { Package, ArrowDownLeft, ArrowUpRight, RefreshCw, Upload, Search, Filter, AlertTriangle, Layers, UserCheck, Plus, Building2, ShoppingBag } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalogo');
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Carga inicial basada directamente en tus capturas de Google Sheets
  const [productos, setProductos] = useState([
    { codigo: '001', nombre: 'Baygon casa y jardín', cat: 'Limpieza', unidad: 'Pza', stock: 25, min: 10, sku: '7501032907570' },
    { codigo: '002', nombre: 'End Bac spray desinfectante', cat: 'Limpieza', unidad: 'Pza', stock: 12, min: 5, sku: '807174547214' },
    { codigo: '003', nombre: 'FamilyGuard', cat: 'Limpieza', unidad: 'Pza', stock: 52, min: 10, sku: '7501032919177' },
    { codigo: '004', nombre: 'Wiese abrillantador', cat: 'Limpieza', unidad: 'Pza', stock: 52, min: 10, sku: '7501821510936' },
    { codigo: '005', nombre: 'Wiese desinfectante', cat: 'Limpieza', unidad: 'Pza', stock: 14, min: 10, sku: '7501821511223' },
    { codigo: '006', nombre: '3 en 1 abrillantador', cat: 'Limpieza', unidad: 'Pza', stock: 28, min: 10, sku: '750108753106' },
    { codigo: '007', nombre: 'Drano 946 ml (Destapa caños)', cat: 'Limpieza', unidad: 'Pza', stock: 23, min: 4, sku: '7501032970079' },
    { codigo: '008', nombre: 'Drano 2.3 Lt', cat: 'Limpieza', unidad: 'Pza', stock: 4, min: 2, sku: '019800401092' },
    { codigo: '009', nombre: 'Gel antibacterial', cat: 'Limpieza', unidad: 'Lt', stock: 0, min: 10, sku: 'MT001' },
    { codigo: '0010', nombre: 'Key tratamiento para mop', cat: 'Limpieza', unidad: 'Lt', stock: 7, min: 5, sku: 'MT002' }
  ]);

  // Personal registrado en tu hoja de Google Sheets
  const personal = [
    { id: '0025', nombre: 'Barrera Limon Angeles', depto: 'Limpieza', plantel: 'Secundaria' },
    { id: '0076', nombre: 'Fabian Huerta Diana Laura', depto: 'Limpieza', plantel: 'Secundaria' },
    { id: '0024', nombre: 'Flores Gonzalez Margarita', depto: 'Limpieza', plantel: 'Secundaria' },
    { id: '0737', nombre: 'Guerrero Meza Joel', depto: 'Limpieza', plantel: 'Secundaria' },
    { id: '0803', nombre: 'Aguilar Romero Hector Gerardo', depto: 'Supervisor', plantel: 'Secundaria' }
  ];

  // Lector de CSV ajustado a tus nombres de columnas exactos
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data.map((row) => ({
            codigo: row['Código'] || row['Codigo'] || '',
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

  const filteredProducts = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Barra Lateral iPad */}
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
              <ArrowUpRight size={20} /> Entradas / Salidas
            </button>
            <button 
              onClick={() => setActiveTab('historial')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition ${activeTab === 'historial' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Filter size={20} /> Historial Filtrable
            </button>
          </nav>
        </div>

        {/* Cargar datos nuevos de Sheets */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <label className="text-xs text-slate-300 font-semibold mb-2 block flex items-center gap-2">
            <Upload size={14} /> Actualizar desde Sheets (.CSV)
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

        {/* Vista Split View iPad */}
        {activeTab === 'catalogo' && (
          <div className="flex-1 flex overflow-hidden p-6 gap-6">
            {/* Lista de Productos (Izquierda) */}
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
                    {p.stock <= p.min && (
                      <span className="flex items-center justify-end gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mt-1">
                        <AlertTriangle size={10} /> Stock Bajo
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Ficha Interactiva (Derecha) */}
            <div className="w-1/2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
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
                    <div className="bg-slate-50 border p-4 rounded-xl text-center min-w-[100px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock Actual</span>
                      <span className={`text-3xl font-black ${selectedProduct.stock <= selectedProduct.min ? 'text-red-500' : 'text-slate-900'}`}>{selectedProduct.stock}</span>
                      <span className="text-xs text-slate-400 block mt-0.5">Mínimo: {selectedProduct.min}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-sm text-slate-700 mb-2">Fotografía del Producto</h4>
                    <div className="w-full h-40 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                      <p className="text-xs">Espacio asignado para foto tomada desde el iPad</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-700 mb-3">Historial de este Producto</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center border">
                      <span className="flex items-center gap-2 font-medium"><ArrowDownLeft className="text-green-500" size={16}/> Stock Inicial de Hoja de Cálculo</span>
                      <span className="font-mono font-bold text-green-600">+{selectedProduct.stock} {selectedProduct.unidad}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Package size={48} className="mb-2 text-slate-300" />
                  <p className="text-sm">Selecciona un producto de la izquierda</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Historial General */}
        {activeTab === 'historial' && (
          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Bitácora de Movimientos</h2>
              <div className="flex gap-2 bg-slate-200 p-1 rounded-xl">
                {['todos', 'entradas', 'salidas', 'ajustes'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition ${filterType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y overflow-hidden shadow-sm">
              <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-green-100 text-green-700 rounded-xl"><ArrowDownLeft size={20} /></div>
                  <div>
                    <h4 className="font-bold text-sm">Carga Inicial de Inventario</h4>
                    <p className="text-xs text-slate-500">Sincronizado con Google Sheets • Hoy</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">{productos.length} productos sincronizados</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
