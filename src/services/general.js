export const formatBytes = (bytes, decimals = 2) => {
	if (!+bytes) return "0 holders"

	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["s", "K", "M", "G", "T", "P"]

	const i = Math.floor(Math.log(bytes) / Math.log(1024))

	return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(dm))} ${sizes[i]}`
}

export const getCeleniumURL = (network) => {
	switch (network) {
		case "mainnet":
			return "https://voyager.online"

		case "sepolia":
			return "https://sepolia.voyager.online"

	}
}
