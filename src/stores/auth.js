import { defineStore } from "pinia"
import { useUsersStore } from "./users"
import { USE_MOCK } from "@/config"
import http from "@/services/http"

export const useAuthStore = defineStore("auth", {
  state: () => ({ user: JSON.parse(localStorage.getItem("user") || "null") }),
  getters: {
    isAuthenticated: (s) => !!s.user,
    isAdminGlobal: (s) => s.user?.role === "admin_global",
    isParent: (s) => s.user?.role === "parent"
  },
  actions: {
    async login(identifiant, motDePasse) {
      if (USE_MOCK) {
        const c = useUsersStore().liste.find((u) => u.identifiant === identifiant)
        if (!c || c.motDePasse !== motDePasse) throw new Error("Identifiant ou mot de passe incorrect.")
        this.user = { id: c.id, nom: c.nom, role: c.role, lieu: c.lieu, enfants: c.enfants || [] }
      } else {
        try {
          const { data } = await http.post("/auth/login", { identifiant, motDePasse })
          localStorage.setItem("token", data.token)
          this.user = data.user
        } catch (e) {
          throw new Error(e.response?.data?.message || "Connexion impossible. V\u00e9rifiez votre connexion.")
        }
      }
      localStorage.setItem("user", JSON.stringify(this.user))
    },
    // Nom affiche mis a jour apres modification par le titulaire (lot 25e)
    majNom(nom) {
      if (!this.user) return
      this.user = { ...this.user, nom }
      localStorage.setItem("user", JSON.stringify(this.user))
    },
    logout() {
      this.user = null
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    }
  }
})
