import React, { useState } from 'react';
import { Package, ArrowDownLeft, ArrowUpRight, RefreshCw, Camera, Search, Filter } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalogo');
  const [filterType, setFilterType] = useState('todos');

  // Datos de prueba simulando tu Google Sheet
  const productos = [
    { id: 1, sku: 'PROD-001', nombre: 'Marcador Azul', stock: 45, min: 10, cat: 'Papelería' },
    { id: 2, sku: 'PROD-002', nombre: 'Hojas Carta', stock: 8, min: 15, cat: 'Papelería' },
    { id: 3, sku: 'PROD-003', nombre: 'Cinta Canela', stock: 20, min: 5, cat: 'Embalaje' }
  ];

  const historial = [
    { id: 101, tipo: 'entrada', prod: 'Marcador Azul', cant: 20, fecha: '2026-08-11', resp: 'Compra Factura #45' },
    { id: 102, tipo: 'salida', prod: 'Hojas Carta', cant: 2, fecha: '2026-08-11', resp: 'Entregado a Juan Pérez' },
    { id: 103, tipo: 'ajuste', prod: 'Cinta Canela', cant: -1, fecha: '2026-08-10', resp: 'Ajuste por Auditoría' }
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Barra Lateral de Navegación iPad */}
      <div className="w-64 bg-slate-900 text-white flex flex-col p-4 justify-between">
        <div>
          <h1 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Package className="text-blue-400" /> Control Almacén
          </h1>
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('catalogo')}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'catalogo' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              <Package size={20} /> Catálogo y Stock
            </button>
            <button 
              onClick={() => setActiveTab('movimiento')}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'movimiento' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              <ArrowUpRight size={20} /> Nuevo Registro
            </button>
            <button 
              onClick={() => setActiveTab('historial')}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'historial' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              <Filter size={20} /> Historial y Filtros
            </button>
          </nav>
        </div>
        <div className="text-xs text-slate-400">Modo Administrador / iPad PWA</div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'catalogo' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Inventario de Productos</h2>
            <div className="grid grid-cols-2 gap-4">
              {productos.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{p.sku}</span>
                    <h3 className="text-lg font-semibold mt-1">{p.nombre}</h3>
                    <p className="text-sm text-slate-500">{p.cat}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${p.stock <= p.min ? 'text-red-500' : 'text-slate-800'}`}>
                      {p.stock}
                    </span>
                    <p className="text-xs text-slate-400">Mínimo: {p.min}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'historial' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Historial de Movimientos</h2>
            <div className="flex gap-2 mb-6">
              {['todos', 'entrada', 'salida', 'ajuste'].map(t => (
                <button 
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filterType === t ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y">
              {historial
                .filter(h => filterType === 'todos' || h.tipo === filterType)
                .map(h => (
                  <div key={h.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {h.tipo === 'entrada' && <ArrowDownLeft className="text-green-500" />}
                      {h.tipo === 'salida' && <ArrowUpRight className="text-blue-500" />}
                      {h.tipo === 'ajuste' && <RefreshCw className="text-amber-500" />}
                      <div>
                        <p className="font-semibold">{h.prod}</p>
                        <p className="text-xs text-slate-500">{h.resp} • {h.fecha}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold">{h.cant > 0 ? `+${h.cant}` : h.cant}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
