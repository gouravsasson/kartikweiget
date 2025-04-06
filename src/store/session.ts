import { create } from "zustand";

// Zustand store for sessionId
const useSessionStore = create((set) => ({
  sessionId: null, // Initial value of sessionId
  setSessionId: (id) => set({ sessionId: id }), // Function to set the sessionId
  getSessionId: () => {
    // Getter function to retrieve the sessionId
    const state = useSessionStore.getState();
    return state.sessionId;
  },
  callId:null,
  callSessionIds:null,
  setCallId:(id:string)=>set({callId:id}),
  setCallSessionIds:(ids:string[])=>set({callSessionIds:ids}),
  getCallId: () => {
    const state = useSessionStore.getState();
    return state.callId;
  },
  getCallSessionIds : () => {
    const state = useSessionStore.getState();
    return state.callSessionIds;
  }
}));

export default useSessionStore;
