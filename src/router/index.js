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
import TransactionDetail from "@/views/dashboard/TransactionDetail.vue"
import TransactionSearch from "@/views/dashboard/TransactionSearch.vue"
import AccountDetail from "@/views/dashboard/AccountDetail.vue"
import AccountSearch from "@/views/dashboard/AccountSearch.vue"
import ProtocolOverview from "@/views/dashboard/ProtocolOverview.vue"

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "main",
			component: MainView,
		},
		{
			path: "/dashboard",
			name: "dashboard",
			component: DashboardView,
			redirect: "/dashboard/protocol-overview",
			children: [
				{
					path: "protocol-overview",
					name: "protocol-overview",
					component: ProtocolOverview,
				},
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
					path: "transaction-search",
					name: "transaction-search",
					component: TransactionSearch,
				},
				{
					path: "transaction/:txHash",
					name: "transaction-detail",
					component: TransactionDetail,
					props: true,
				},
				{
					path: "account-search",
					name: "account-search",
					component: AccountSearch,
				},
				{
					path: "account/:accountId",
					name: "account-detail",
					component: AccountDetail,
					props: true,
				},
			],
		},
	],
})

export default router