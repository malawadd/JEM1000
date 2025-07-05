<script setup>
import { ref, computed } from "vue"
import { useRoute } from "vue-router"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar.vue"
import DashboardTopbar from "@/components/dashboard/DashboardTopbar.vue"
import MobileControls from "@/components/dashboard/MobileControls.vue"

const route = useRoute()

const sidebarOpen = ref(true)
const isMobile = ref(window.innerWidth <= 1024)

// Listen for window resize
window.addEventListener('resize', () => {
	isMobile.value = window.innerWidth <= 1024
	if (isMobile.value) {
		sidebarOpen.value = false
	}
})

const dashboardPages = [
	{ key: "protocol-overview", name: "PROTOCOL OVERVIEW", icon: "zap-circle" },
	{ key: "swap-positions", name: "SWAP POSITIONS", icon: "arrow-top-right" },
	{ key: "liquidations", name: "LIQUIDATIONS", icon: "zap" },
	{ key: "lending-overview", name: "LENDING OVERVIEW", icon: "coins" },
	{ key: "vault-analytics", name: "VAULT ANALYTICS", icon: "blob" },
	{ key: "earn-harvests", name: "EARN HARVESTS", icon: "check-circle" },
	{ key: "whale-tracking", name: "WHALE TRACKING", icon: "coins" },
]

const currentPage = computed(() => {
	return dashboardPages.find(page => page.key === route.name)
})

const handleNavigation = () => {
	if (isMobile.value) {
		sidebarOpen.value = false
	}
}

const toggleSidebar = () => {
	sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
	sidebarOpen.value = false
}
</script>

<template>
	<div :class="$style.dashboard">
		<MobileControls 
			:isMobile="isMobile"
			:sidebarOpen="sidebarOpen"
			@toggle="toggleSidebar"
			@closeOverlay="closeSidebar"
		/>

		<DashboardSidebar 
			:sidebarOpen="sidebarOpen"
			:isMobile="isMobile"
			:dashboardPages="dashboardPages"
			@navigate="handleNavigation"
			@toggle="toggleSidebar"
		/>

		<main :class="$style.main">
			<DashboardTopbar 
				:currentPage="currentPage"
				:isMobile="isMobile"
			/>

			<div :class="$style.content">
				<RouterView />
			</div>
		</main>
	</div>
</template>

<style module>
.dashboard {
	display: flex;
	height: 100vh;
	background: var(--app-background);
	overflow: hidden;
	position: relative;
}

.main {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.content {
	flex: 1;
	overflow: auto;
	padding: 24px;
	background: radial-gradient(circle at 20% 80%, rgba(0, 255, 157, 0.03) 0%, transparent 50%),
				radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.03) 0%, transparent 50%);
}

@media (max-width: 1024px) {
	.main {
		width: 100%;
	}
	
	.content {
		padding: 16px;
	}
}
</style>