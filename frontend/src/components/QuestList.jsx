import React from "react";
import { useQuesManagerContract } from "../hooks/useQuesManagerContract";
import { useAccount } from "wagmi";
import { List } from "flowbite-react";

/**
 * Normaliza una misión devuelta por el contrato a tipos amigables para el UI.
 */


export default function QuestList() {
  const { contractWriteQ, contractReadQ } = useQuesManagerContract();
  const { address } = useAccount();

  const [quests, setQuests] = React.useState([]);
  const [isOwner, setIsOwner] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  // pending es un diccionario por id normalizada (string)
  const [pending, setPending] = React.useState({});

  /**
   * Carga owner y lista de misiones desde el contrato.
   * Se memoiza para evitar efectos innecesarios.
   */
  const load = React.useCallback(async () => {
    if (!address || !contractReadQ) return;
    try {
      const [owner, list] = await Promise.all([
        contractReadQ.isOwner(address),
        contractReadQ.getQuests(),
      ]);
      setIsOwner(Boolean(owner));
      console.log("Lista de misiones : ", list)
      console.log("Lista de misiones : ", list[4].nombre)
      setQuests(list);
    } catch (e) {
      console.error("Error cargando datos:", e);
    }
  }, [address, contractReadQ]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleAddQuest = async (nombre, xp) => {
    if (!contractWriteQ) {
      console.error("Contrato QuestManager no inicializado");
      return;
    }
    try {
      const tx = await contractWriteQ.addQuest(nombre, xp);
      console.log("Transacción enviada : ", tx)
      await tx.wait();
      await load(); 
    } catch (error) {
      console.error("Error al añadir misión:", error);
      alert(
        error?.shortMessage ||
          error?.message ||
          "No se pudo añadir la misión (¿eres el owner?)."
      );
    }
  };

  const handleCompleteQuest = async (idStr) => {
    if (!contractWriteQ) {
      console.error("Contrato QuestManager no inicializado");
      return;
    }
    try {
      setPending((p) => ({ ...p, [idStr]: true }));


      let onchainId;
      try {
        onchainId = BigInt(idStr);
      } catch {
        onchainId = Number(idStr);
      }

      const tx = await contractWriteQ.completeQuest(onchainId);
      await tx.wait();
      await load(); 
    } catch (error) {
      console.error("Error al completar misión:", error);
      alert(
        error?.shortMessage || error?.message || "No se pudo completar la misión."
      );
    } finally {
      setPending((p) => ({ ...p, [idStr]: false }));
    }
  };

  return (
    <aside
      className="fixed right-4 top-24 md:top-24 z-30 w-80 lg:w-96"
      aria-label="Panel de misiones"
    >
      {/* Botón para añadir una misión de prueba (solo owner) */}
      {isOwner && (
        <button
          className="mb-2 p-2 rounded-lg border border-yellow-900 text-yellow-900 hover:bg-yellow-50 transition bg-yellow-100"
          onClick={() => handleAddQuest("Esta es una misión de prueba", 100)}
        >
          Añadir misión
        </button>
      )}

      {/* Tarjeta */}
      <div className="bg-white/80 backdrop-blur-md border border-yellow-200 rounded-2xl shadow-xl">
        {/* Header compacto */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-yellow-900">📜 Misiones</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-900 font-semibold">
              {quests.length}
            </span>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-yellow-900 text-xs px-2 py-1 rounded-lg border border-yellow-300 hover:bg-yellow-50 transition"
            aria-expanded={open}
            aria-controls="quests-body"
            title={open ? "Ocultar" : "Mostrar"}
          >
            {open ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {/* Body con scroll */}
        {open && (
          <div id="quests-body" className="px-2 pb-2">
            <ul className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {quests.map((mision) => {
                const idStr = String(mision.id);
                const isPending = !!pending[mision.isActive];
                console.log(isPending)
                const descripcion = (mision.description || "desconocida").toLowerCase();

                return (
                  <li
                    key={idStr}
                    className="
                      flex items-start p-2 rounded-xl
                      bg-yellow-50/70 border border-yellow-100
                      hover:bg-yellow-50 transition
                    "
                  >
                    <div className="mr-2 flex-shrink-0">
                      <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold shadow">
                        {idStr}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-yellow-900 text-sm truncate">
                          {mision.nombre}
                        </span>
                      </div>

                      {descripcion && (
                        <p className="text-[11px] text-yellow-800 mt-0.5 line-clamp-2">
                          {descripcion}
                        </p>
                      )}

                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <span className="bg-yellow-200 text-yellow-900 px-2 py-[2px] rounded text-[10px] font-medium">
                          XP: {mision.xpReward}
                        </span>

                      </div>
                    </div>

                    {/* Acciones compactas */}
                    <div className="ml-2 flex flex-col gap-1">
                      <button
                        onClick={() => handleCompleteQuest(idStr)}
                        disabled={!mision.isActive}
                        className={`text-[11px] px-2 py-1 rounded-lg border
                          ${
                            !mision.isActive
                              ? "bg-green-600 border-white text-white cursor-not-allowed"
                              : "border-yellow-900 text-yellow-900 hover:bg-yellow-50 cursor-pointer hover:scale-110 transition-all duration-300"
                          }
                          transition`}
                        title="Completar misión"
                      >
                        {!mision.isActive ? "Completada" : "Completar"}
                      </button>

                      {/* Si quieres clonar misiones como owner, habilita este botón */}
                      {/* {isOwner && (
                        <button
                          onClick={() => handleAddQuest(mision.nombre, mision.XP)}
                          className="text-[11px] px-2 py-1 rounded-lg border border-yellow-900 text-yellow-900 hover:bg-yellow-50 transition"
                          title="Clonar misión on-chain"
                        >
                          Clonar
                        </button>
                      )} */}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
