<script setup>
import { ref, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAppStore } from "@/stores/app"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

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
	{ key: "swap-positions", name: "SWAP POSITIONS", icon: "arrow-top-right" },
	{ key: "liquidations", name: "LIQUIDATIONS", icon: "zap" },
	{ key: "lending-overview", name: "LENDING OVERVIEW", icon: "coins" },
	{ key: "vault-analytics", name: "VAULT ANALYTICS", icon: "blob" },
	{ key: "earn-harvests", name: "EARN HARVESTS", icon: "check-circle" },
	{ key: "whale-tracking", name: "WHALE TRACKING", icon: "zap-circle" },
]

const currentPage = computed(() => {
	return dashboardPages.find(page => page.key === route.name)
})

const navigateToPage = (pageKey) => {
	router.push(`/dashboard/${pageKey}`)
	// Close sidebar on mobile after navigation
	if (isMobile.value) {
		sidebarOpen.value = false
	}
}

const toggleSidebar = () => {
	sidebarOpen.value = !sidebarOpen.value
}

const handleNetworkChange = (networkKey) => {
	appStore.network = networkKey
}
</script>

<template>
	<div :class="$style.dashboard">
		<!-- Mobile Overlay -->
		<div 
			v-if="isMobile && sidebarOpen" 
			:class="$style.overlay" 
			@click="sidebarOpen = false"
		/>

		<!-- Mobile Menu Button -->
		<button 
			v-if="isMobile" 
			@click="toggleSidebar" 
			:class="$style.mobileMenuBtn"
		>
			<Icon name="chevron" size="20" color="primary" :rotate="sidebarOpen ? 90 : 0" />
		</button>

		<!-- Sidebar -->
		<aside :class="[$style.sidebar, !sidebarOpen && $style.collapsed, isMobile && $style.mobile]">
			<div :class="$style.sidebarHeader">
				<Flex align="center" gap="12">
					<Icon name="logo" size="24" color="primary" />
					<Text v-if="sidebarOpen" size="16" weight="700" color="primary">EULER ANALYTICS</Text>
				</Flex>
				<button v-if="!isMobile" @click="toggleSidebar" :class="$style.toggleBtn">
					<Icon name="chevron" size="16" color="secondary" :rotate="sidebarOpen ? 180 : 0" />
				</button>
			</div>

			<nav :class="$style.navigation">
				<div v-if="sidebarOpen" :class="$style.navSection">
					<Text size="11" weight="600" color="tertiary">ANALYTICS MODULES</Text>
				</div>
				
				<div
					v-for="page in dashboardPages"
					:key="page.key"
					@click="navigateToPage(page.key)"
					:class="[$style.navItem, route.name === page.key && $style.active]"
				>
					<Icon :name="page.icon" size="16" color="secondary" />
					<Text v-if="sidebarOpen" size="13" weight="600" color="secondary">{{ page.name }}</Text>
				</div>
			</nav>

			<div v-if="sidebarOpen" :class="$style.sidebarFooter">
				<Text size="11" weight="500" color="support">SYSTEM STATUS: ONLINE</Text>
			</div>
		</aside>

		<!-- Main Content -->
		<main :class="$style.main">
			<!-- Top Bar -->
			<header :class="$style.topbar">
				<Flex align="center" justify="between" wide>
					<Flex align="center" gap="16">
						<Text size="18" weight="700" color="primary">{{ currentPage?.name || 'DASHBOARD' }}</Text>
						<div :class="$style.statusIndicator" />
						<Text size="12" weight="600" color="green">SYNCHRONIZED</Text>
					</Flex>

					<Flex align="center" gap="16">
						<!-- Network Selector -->
						<Dropdown fullWidth height="300px" verticalOverflow>
							<Flex align="center" gap="16" :class="$style.networkSelector">
								<Flex align="center" gap="8">
									<div :class="$style.networkDot" />
									<Text size="13" weight="700" color="primary" style="text-transform: uppercase">
										{{ appStore.network }}
									</Text>
								</Flex>
								<Icon name="chevron" size="14" color="tertiary" />
							</Flex>

							<template #popup>
								<DropdownItem 
									v-for="network in appStore.networks" 
									:key="network.key" 
									@click="handleNetworkChange(network.key)"
								>
									<Flex align="center" gap="8">
										<Icon :name="appStore.network === network.key ? 'check' : ''" size="14" color="secondary" /> 
										{{ network.name }}
									</Flex>
								</DropdownItem>
							</template>
						</Dropdown>

						<!-- Home Link -->
						<router-link to="/" :class="$style.homeLink">
							<Icon name="arrow-top-right" size="16" color="secondary" />
							<Text size="12" weight="700" color="secondary">MAIN VIEW</Text>
						</router-link>
					</Flex>
				</Flex>
			</header>

			<!-- Page Content -->
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

.overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.7);
	z-index: 999;
}

.mobileMenuBtn {
	position: fixed;
	top: 20px;
	left: 20px;
	z-index: 1001;
	background: linear-gradient(135deg, rgba(0, 255, 157, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%);
	border: 2px solid rgba(0, 255, 157, 0.3);
	border-radius: 8px;
	padding: 8px;
	transition: all 0.2s ease;
}

.mobileMenuBtn:hover {
	background: linear-gradient(135deg, rgba(0, 255, 157, 0.3) 0%, rgba(0, 0, 0, 0.9) 100%);
	box-shadow: 0 0 20px rgba(0, 255, 157, 0.3);
}

.sidebar {
	width: 280px;
	background: linear-gradient(180deg, rgba(0, 255, 157, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%);
	border-right: 2px solid rgba(0, 255, 157, 0.2);
	display: flex;
	flex-direction: column;
	transition: all 0.3s ease;
	position: relative;
	z-index: 1000;
}

.sidebar.collapsed {
	width: 70px;
}

.sidebar.mobile {
	position: fixed;
	height: 100vh;
	top: 0;
	left: 0;
	transform: translateX(0);
}

.sidebar.mobile.collapsed {
	transform: translateX(-100%);
	width: 280px;
}

.sidebarHeader {
	padding: 20px;
	border-bottom: 1px solid rgba(0, 255, 157, 0.1);
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.toggleBtn {
	background: rgba(0, 255, 157, 0.1);
	border: 1px solid rgba(0, 255, 157, 0.3);
	border-radius: 4px;
	padding: 6px;
	transition: all 0.2s ease;
}

.toggleBtn:hover {
	background: rgba(0, 255, 157, 0.2);
	box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
}

.navigation {
	flex: 1;
	padding: 20px 0;
	overflow-y: auto;
}

.navSection {
	padding: 0 20px 12px;
	margin-bottom: 8px;
}

.navItem {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 20px;
	cursor: pointer;
	transition: all 0.2s ease;
	border-left: 3px solid transparent;
}

.navItem:hover {
	background: rgba(0, 255, 157, 0.05);
	border-left-color: rgba(0, 255, 157, 0.3);
}

.navItem.active {
	background: rgba(0, 255, 157, 0.1);
	border-left-color: #00ff9d;
	box-shadow: inset 0 0 20px rgba(0, 255, 157, 0.1);
}

.sidebarFooter {
	padding: 20px;
	border-top: 1px solid rgba(0, 255, 157, 0.1);
}

.main {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.topbar {
	height: 70px;
	background: linear-gradient(90deg, rgba(255, 0, 255, 0.05) 0%, rgba(0, 255, 255, 0.05) 100%);
	border-bottom: 2px solid rgba(0, 255, 255, 0.2);
	padding: 0 24px;
	display: flex;
	align-items: center;
}

.statusIndicator {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #00ff9d;
	box-shadow: 0 0 10px #00ff9d;
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.5; }
}

.networkSelector {
	height: 36px;
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid rgba(0, 255, 255, 0.3);
	border-radius: 6px;
	padding: 0 12px;
	cursor: pointer;
	transition: all 0.2s ease;
	min-width: 140px;
}

.networkSelector:hover {
	border-color: rgba(0, 255, 255, 0.5);
	box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.networkDot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #00ffff;
	box-shadow: 0 0 8px #00ffff;
}

.homeLink {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: rgba(255, 0, 255, 0.1);
	border: 1px solid rgba(255, 0, 255, 0.3);
	border-radius: 6px;
	transition: all 0.2s ease;
	text-decoration: none;
}

.homeLink:hover {
	background: rgba(255, 0, 255, 0.2);
	box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
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
	
	.topbar {
		padding-left: 80px;
	}
	
	.content {
		padding: 16px;
	}
}

@media (max-width: 768px) {
	.homeLink span {
		display: none;
	}
	
	.networkSelector {
		min-width: 120px;
	}
}
</style>