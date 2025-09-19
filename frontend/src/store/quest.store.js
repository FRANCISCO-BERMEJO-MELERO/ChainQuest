import {create} from 'zustand';

class Quest{
    constructor(id, description, reward, state){
        this.id = id;
        this.description = description;
        this.reward = reward;
        this.state = state; // AVAILABLE, IN_PROGRESS, READY_TO_CLAIM, CLAIMING, COMPLETED
    }


}

// Definición 
const useQuestStore = create((set)=>({
    quests:[],
    hydrateQuest: (quests) => set({ quests }), // sobreescribe todo el array
    setStatus: (id, newState) => set((state) => ({ 
        quests: state.quests.map(
            quests => quests.id === id ? { ...quests, state: newState } : quests
            ) 
    })),

}))
export { useQuestStore, Quest };