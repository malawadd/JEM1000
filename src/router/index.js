import { createRouter, createWebHistory } from "vue-router"

import MainView from "@/views/MainView.vue"
import DashboardView from "@/views/DashboardView.vue"
import SwapPositions from "@/views/dashboard/SwapPositions.vue"
import Liquidations from "@/views/dashboard/Liquidations.vue"
import LendingOverview from "@/views/dashboard/LendingOverview.vue"
import VaultAnalytics from "@/views/dashboard/VaultAnalytics.vue"
import EarnHarvests from "@/views/dashboard/EarnHarvests.vue"
import WhaleTracking from "@/views/dashboard/WhaleTracking.vue"
import VaultDetail from "@/views/dashboard/VaultDetail.vue"
import TransactionDetailView from "@/views/TransactionDetailView.vue"
import TransactionDetailView from "@/views/TransactionDetailView.vue"

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "main",
			component: MainView,
		},
		{
			path: "/transaction/:txHash",
			name: "transaction-detail",
			component: TransactionDetailView,
			props: true,
		},
		{
			path: "/dashboard",
			name: "dashboard",
			component: DashboardView,
			redirect: "/dashboard/swap-positions",
			children: [
				{
					path: "swap-positions",
					name: "swap-positions",
					component: SwapPositions,
				},
				{
					path: "liquidations",
					name: "liquidations",
					component: Liquidations,
				},
				{
					path: "lending-overview",
					name: "lending-overview",
					component: LendingOverview,
				},
				{
					path: "vault-analytics",
					name: "vault-analytics",
					component: VaultAnalytics,
				},
				{
					path: "vault/:vaultId",
					name: "vault-detail",
					component: VaultDetail,
					props: true,
				},
				{
					path: "earn-harvests",
					name: "earn-harvests",
					component: EarnHarvests,
				},
				{
					path: "whale-tracking",
					name: "whale-tracking",
					component: WhaleTracking,
				},
				{
					path: "transaction/:txHash",
				}
			]
		}
	]
})

export default router