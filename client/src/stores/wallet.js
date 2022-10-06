import { defineStore } from 'pinia'

export const useWalletStore = defineStore('wallet', {
    state: () => {
        return { walletData: null }
    },

    actions: {
        //@ts-ignore
        saveWalletData(payload) {
            this.walletData = payload
        },
    },
})
