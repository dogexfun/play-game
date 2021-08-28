let web3;
if (typeof window.ethereum !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3 = new Web3(window.ethereum);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed1.ninicoin.io/"));
}

const formatter = new Intl.NumberFormat('en-US');

const connect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const balance = await token.methods.balanceOf(accounts[0]).call()

        connectedElement(accounts[0], balance)
      } catch (error) {
        if (error.code === 4001) {
          // User rejected request
        }
      }
    }
}

const connectedElement = async (account) => {
	$('#connect').html(addressText(account))
}

const connectBtn = `
<button class="btn btn-danger w-100 fw-semibold connect-btn">Connect</button>
`
const addressText = (address) => {
	return `<p class="text-danger">${address}</p>`
}

$(document).ready(async function() {
	const accounts = await web3.eth.getAccounts()

	if(accounts[0] !== undefined) {
		await connectedElement(accounts[0])
	} else {
		$('#connect').html(connectBtn)
	}
})

$('#connect').on('click', '.connect-btn', function() {
	connect()
})

$('.unlock').click(function() {
	connect()
})