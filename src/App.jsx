import React, { useState } from 'react';
import Papa from 'papaparse';
import { Package, ArrowDownLeft, ArrowUpRight, RefreshCw, Upload, Search, Filter, AlertTriangle, Layers, UserCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalogo');
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productos, setProductos] = useState([]);

  // Procesador inteligente del CSV de tu Google Sheet
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log("Datos del CSV:", results.data);
          const parsedData = results.data.map((row, index) => {
            // Obtener el valor buscando en varias posibles variaciones de nombres de columna
            const keys = Object.keys(row);
            const findValue = (possibleNames) => {
              const matchedKey = keys.find(k => possibleNames.some(p => k.trim().toLowerCase().includes(p.toLowerCase())));
              return matchedKey ? row[matchedKey] : null;
            };

            const skuVal = findValue(['sku', 'código', 'codigo', 'id', 'clave']) || `PROD-${index + 1}`;
            const nombreVal = findValue(['producto', 'nombre', 'descripcion', 'descripción', 'artículo', 'articulo']) || `Producto ${index + 1}`;
            const stockVal = parseInt(findValue(['stock', 'existencia', 'existencias', 'cantidad', 'saldo', 'total']) || 0);
            const minVal = parseInt(findValue(['mínimo', 'minimo', 'min']) || 5);
            const catVal = findValue(['categoría', 'categoria', 'departamento', 'familia']) || 'General';

            return {
              id: index + 1,
              sku: String(skuVal),
              nombre: String(nombreVal),
              stock: isNaN(stockVal) ? 0 : stockVal,
              min: isNaN(minVal) ? 5 : minVal,
              cat: String(catVal)
            };
          });

          setProductos(parsedData);
          if (parsedData.length > 0) {
            setSelectedProduct(parsedData[0]);
          }
        }
      });
    }
  };

  const filteredProducts = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sidebar Lateral para iPad */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col p-6 justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2 rounded-xl">
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

        {/* Cargar CSV */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <label className="text-xs text-slate-300 font-semibold mb-2 block flex items-center gap-2">
            <Upload size={14} /> Cargar CSV de Productos
          </label>
          <input 
            type="file" 
            accept=".csv"
            onChange={handleFileUpload}
            className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer w-full"
          />
        </div>
      </aside>

      {/* Panel Principal */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border">
            <UserCheck size={16} className="text-green-600" /> Operador / Supervisor
          </div>
        </header>

        {activeTab === 'catalogo' && (
          <div className="flex-1 flex overflow-hidden p-6 gap-6">
            {productos.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                <Upload size={48} className="text-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Carga tu archivo CSV</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Usa el botón "Cargar CSV" del menú lateral para importar tu lista de productos de Google Sheets.
                </p>
              </div>
            ) : (
              <>
                {/* Lista de Productos */}
                <div className="w-1/2 overflow-y-auto space-y-3 pr-2">
                  {filteredProducts.map(p => (
                    <div 
                      key={p.sku + p.id} 
                      onClick={() => setSelectedProduct(p)}
                      className={`p-4 rounded-2xl bg-white border transition cursor-pointer flex justify-between items-center ${selectedProduct?.sku === p.sku ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{p.sku}</span>
                        <h3 className="font-bold text-slate-800 mt-1">{p.nombre}</h3>
                        <span className="text-xs text-slate-400">{p.cat}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-black ${p.stock <= p.min ? 'text-red-500' : 'text-slate-800'}`}>
                          {p.stock}
                        </span>
                        {p.stock <= p.min && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mt-1">
                            <AlertTriangle size={10} /> Stock Bajo
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detalle del Producto */}
                <div className="w-1/2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
                  {selectedProduct ? (
                    <div>
                      <div className="flex justify-between items-start mb-6 border-b pb-4">
                        <div>
                          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{selectedProduct.sku}</span>
                          <h2 className="text-2xl font-black text-slate-900 mt-2">{selectedProduct.nombre}</h2>
                          <p className="text-sm text-slate-500">{selectedProduct.cat}</p>
                        </div>
                        <div className="bg-slate-50 border p-4 rounded-xl text-center">
                          <span className="text-xs text-slate-400 font-semibold uppercase block">Stock Actual</span>
                          <span className={`text-3xl font-black ${selectedProduct.stock <= selectedProduct.min ? 'text-red-500' : 'text-slate-900'}`}>{selectedProduct.stock}</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-slate-700 mb-3">Historial Individual del Producto</h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center border">
                          <span className="flex items-center gap-2 font-medium"><ArrowDownLeft className="text-green-500" size={16}/> Carga Inicial de Registro</span>
                          <span className="font-mono font-bold text-green-600">+{selectedProduct.stock}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Package size={48} className="mb-2 text-slate-300" />
                      <p className="text-sm">Selecciona un producto de la lista izquierda</p>
                    </div>
                  )}
                </div>
              </>
            )}
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
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition ${filterType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
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
                    <h4 className="font-bold text-sm">Entrada Registrada</h4>
                    <p className="text-xs text-slate-500">Carga de Archivo CSV • Hoy</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">{productos.length} productos cargados</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
