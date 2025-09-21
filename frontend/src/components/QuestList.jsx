import { useState, useCallback, useEffect } from "react";
import { useQuesManagerContract } from "../hooks/contracts/useQuesManagerContract";
import { useAccount } from "wagmi";
import { List } from "flowbite-react";
import { Quest, useQuestStore } from "../store/quest.store"

/**
 * TODO: Implementar la lógica de las quests:
 * - Cargar de forma correcta los estado de las quest, según si lo ha completado o no el usuario. Para ello hay un map de completed en el contrato. 
 * 
 */

export default function QuestList() {
  const { contractWriteQ, contractReadQ } = useQuesManagerContract();
  const { address } = useAccount();

  const [isOwner, setIsOwner] = useState(false);
  const [open, setOpen] = useState(true);

  const hydrateQuest = useQuestStore((state) => state.hydrateQuest);
  const setStatus = useQuestStore((state) => state.setStatus);
  const questsStore = useQuestStore((state) => state.quests)




  const load = useCallback(async () => {
    if (!address || !contractReadQ){
      
      hydrateQuest([]);
      return;
      }
    try {
      const [owner, list, questCompleted] = await Promise.all([
        contractReadQ.isOwner(address),
        contractReadQ.getQuests(),
        contractReadQ.getQuestCompleted(address),
      ]);
      setIsOwner(Boolean(owner));
      console.log("Quests completadas de ", address , "  :", questCompleted);
      // console.log(list)
      // console.log("Esta activa:",list[2].isActive);
      let parsedList = list.map((q) => (new Quest(q.id ,q.description, q.xpReward)));
      parsedList.shift()
      parsedList = setCompletedQuest(questCompleted, parsedList)
      console.log(parsedList)

      hydrateQuest(parsedList)
    } catch (e) {
      console.error("Error cargando datos:", e);
    }
  }, [address, contractReadQ, hydrateQuest]);

  useEffect(() => {
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
      window.location.reload();
      alert(
        error?.shortMessage ||
          error?.message ||
          "No se pudo añadir la misión (¿eres el owner?)."
          
      );
    }
  };

  const setCompletedQuest = (completed, parsedList) => {
    parsedList.forEach((quest) => {
      if (completed.includes(quest.id)) {
        quest.state = "COMPLETED";
      } else {
        quest.state = "AVAILABLE";
      }
    });
    return parsedList;
  }

  const handleCompleteQuest = async (idStr) => {
    if (!contractWriteQ) {
      console.error("Contrato QuestManager no inicializado");
      return;
    }
    try {
      let onchainId;
      try {
        onchainId = BigInt(idStr);
      } catch {
        onchainId = Number(idStr);
      }
      hydrateQuest(
        questsStore.map((q) =>
          q.id === idStr ? { ...q, state: "CLAIMING" } : q
        )
      );
      const tx = await contractWriteQ.completeQuest(onchainId);
      await tx.wait();
      await load();
    } catch (error) {
      console.error("Error al completar misión:", error);
      alert(
        error?.shortMessage || error?.message || "No se pudo completar la misión."
      );
      window.location.reload();
    }
  };



  return (
   <aside
  className="fixed right-36 top-40 z-30 w-80 lg:w-96"
  aria-label="Panel de misiones"
>
  {/* Botón añadir misión (solo owner) */}
  {isOwner && (
    <button
      className="mb-3 w-full py-2 rounded-lg border border-[#a77a2d] bg-[#eadcb8] text-[#3b2a1a] font-semibold shadow-md hover:brightness-105 transition"
      onClick={() => handleAddQuest("Esta es una misión de prueba", 100)}
    >
      ➕ Añadir misión
    </button>
  )}

  {/* Tarjeta pergamino */}
  <div className="rounded-2xl shadow-xl overflow-hidden border bg-[#eadcb8] ">
    {/* Header compacto */}
    <div className="flex items-center justify-between px-4 py-2 bg-[#eadcb8]">
      <div className="flex items-center gap-2">
        <span className="text-base font-extrabold text-[#3b2a1a]">📜 Misiones</span>
        <span className="px-2 py-0.5 rounded-full bg-[#d4a962] text-[#3b2a1a] text-xs font-bold">
          {questsStore.length}
        </span>
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs px-2 py-1 rounded-md border border-[#c6a94a] bg-[#f7eac4] text-[#3b2a1a] hover:brightness-105 transition"
      >
        {open ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>

    {/* Body con scroll */}
    {open && (
      <div id="quests-body" className="px-3 pb-3">
        <ul className="max-h-72 overflow-y-auto space-y-3 pr-1">
          {questsStore.map((quest) => {
            const idStr = String(quest.id);
            const descripcion = quest.description || 'desconocida';

            return (
              <li
                key={idStr}
                className="flex items-start p-3 rounded-xl bg-[#fdf8e1] border border-[#e2cf8c] shadow-sm"
              >
                {/* Número */}
                <div className="mr-3 flex-shrink-0">
                  <span className="bg-[#a77a2d] text-white rounded-full w-7 h-7 flex items-center justify-center text-[12px] font-bold shadow">
                    {idStr}
                  </span>
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#3b2a1a] text-base truncate">
                      {quest.nombre}
                    </span>
                  </div>

                  {descripcion && (
                    <p className="text-sm text-[#5a4633] mt-1 line-clamp-2 italic">
                      {descripcion}
                    </p>
                  )}

                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <span className="bg-[#f2d98c] text-[#3b2a1a] px-2 py-[2px] rounded text-xs font-medium border border-[#d6c497]">
                      ⭐ XP: {quest.reward}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="ml-3 flex flex-col gap-1">
                  {quest.state === 'AVAILABLE' && (
                    <button
                      onClick={() => {
                        setStatus(quest.id, 'IN_PROGRESS');
                        handleCompleteQuest(quest.id);
                      }}
                      className="px-3 py-1 text-xs font-semibold rounded-lg border border-[#a77a2d] bg-[#f2d98c] text-[#3b2a1a] hover:brightness-105 transition"
                    >
                      Iniciar
                    </button>
                  )}

                  {quest.state === 'IN_PROGRESS' && (
                    <button className="px-3 py-1 text-xs font-semibold rounded-lg border border-blue-800 bg-blue-200 text-blue-900 hover:bg-blue-300 transition">
                      Reanudar
                    </button>
                  )}

                  {quest.state === 'READY_TO_CLAIM' && (
                    <button className="px-3 py-1 text-xs font-semibold rounded-lg border border-green-800 bg-green-200 text-green-900 hover:bg-green-300 transition animate-pulse">
                      Reclamar
                    </button>
                  )}

                  {quest.state === 'CLAIMING' && (
                    <button
                      disabled
                      className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                    >
                      Reclamando...
                    </button>
                  )}

                  {quest.state === 'COMPLETED' && (
                    <button
                      disabled
                      className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                    >
                      Completada
                    </button>
                  )}
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
