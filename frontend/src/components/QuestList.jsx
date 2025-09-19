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
  }, [address, contractReadQ]);

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

      const tx = await contractWriteQ.completeQuest(onchainId);
      await tx.wait();
      await load(); 
    } catch (error) {
      console.error("Error al completar misión:", error);
      alert(
        error?.shortMessage || error?.message || "No se pudo completar la misión."
      );
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
              {questsStore.length}
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
              {questsStore.map((quest) => {
                const idStr = String(quest.id);
                const isPending = quest.state === "AVAILABLE" || quest.state === "IN_PROGRESS" ;
                console.log(isPending)
                const descripcion = (quest.description || "desconocida");

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
                          {quest.nombre}
                        </span>
                      </div>

                      {descripcion && (
                        <p className="text-[11px] text-yellow-800 mt-0.5 line-clamp-2">
                          {descripcion}
                        </p>
                      )}

                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <span className="bg-yellow-200 text-yellow-900 px-2 py-[2px] rounded text-[10px] font-medium">
                          XP: {quest.reward}
                        </span>

                      </div>
                    </div>

                    {/* Acciones compactas */}
                    <div className="ml-2 flex flex-col gap-1">
                      {quest.state === "AVAILABLE" && (
                        <button
                          onClick={() => {
                            setStatus(quest.id, "IN_PROGRESS")
                            handleCompleteQuest(quest.id)
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-yellow-900 text-yellow-900 bg-yellow-100 hover:bg-yellow-200 transition-colors duration-200"
                        >
                          Iniciar Quest
                        </button>
                      )}

                      {quest.state === "IN_PROGRESS" && (
                        <button
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-900 text-blue-900 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                        >
                          Reanudar misión
                        </button>
                      )}

                      {quest.state === "READY_TO_CLAIM" && (
                        <button
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-900 text-green-900 bg-green-100 hover:bg-green-200 transition-colors duration-200 animate-pulse"
                        >
                          Reclamar recompensa
                        </button>
                      )}

                      {quest.state === "COMPLETED" && (
                        <button
                          disabled
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                        >
                          Completada
                        </button>
                      )}


                      {/* Si quieres clonar quests como owner, habilita este botón */}
                      {/* {isOwner && (
                        <button
                          onClick={() => handleAddQuest(quest.nombre, quest.XP)}
                          className="text-[11px] px-2 py-1 rounded-lg border border-yellow-900 text-yellow-900 hover:bg-yellow-50 transition"
                          title="Clonar misión on-chain"
                        >
                          Clonar
                        </button>
                      )} */}



{/* 
                      <button
                        onClick={() => handleCompleteQuest(idStr)}
                        disabled={!quest.isActive}
                        className={`text-[11px] px-2 py-1 rounded-lg border
                          ${
                            !quest.isActive
                              ? "bg-green-600 border-white text-white cursor-not-allowed"
                              : "border-yellow-900 text-yellow-900 hover:bg-yellow-50 cursor-pointer hover:scale-110 transition-all duration-300"
                          }
                          transition`}
                        title="Completar misión"
                      >
                        {!quest.isActive ? "Completada" : "Completar"}
                      </button> */}




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
