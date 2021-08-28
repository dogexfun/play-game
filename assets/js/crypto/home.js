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

const connectedElement = async (account, balance) => {

	$('.unlock').text('Claim Reward')
	$('.unlock').attr('disabled', 'true')

	$('#connect').html(addressText(account))
	$('.token-balance').text(formatter.format(balance / 10**18) + " DOGEX")
}

const connectBtn = `
<button class="btn btn-danger w-100 fw-semibold connect-btn">Connect</button>
`
const addressText = (address) => {
	return `<p class="text-danger">${address}</p>`
}

$(document).ready(async function() {
	const zeroAddress = "0x0000000000000000000000000000000000000000"
	const accounts = await web3.eth.getAccounts()
	const totalSupply = await token.methods.totalSupply().call()
	const tokenBurned = await token.methods.balanceOf(zeroAddress).call()

	if(accounts[0] !== undefined) {
		const balance = await token.methods.balanceOf(accounts[0]).call()
		await connectedElement(accounts[0], balance)
	} else {
		$('#connect').html(connectBtn)
	}

	$('#supply').text(formatter.format(totalSupply / 10**18))
	$('#burned').text(formatter.format(tokenBurned / 10**18))
})

$('#connect').on('click', '.connect-btn', function() {
	connect()
})

$('.unlock').click(function() {
	connect()
})