const formatter = new Intl.NumberFormat('en-US');
let basePrice = 0

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

const balanceFormater = (amount) => {
	return formatter.format(web3.utils.fromWei(amount.toString()))
}

const timeConverter = (UNIX_timestamp) => {
  const a = new Date(UNIX_timestamp * 1000);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const date = a.getDate();
  const hour = a.getHours();
  const min = a.getMinutes();
  const sec = a.getSeconds();
  const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

const connectedElement = async (account) => {
	$('#connect').html(addressText(account))

}

const calcBnbAndToken = () => {
	const bnb = $('#bnb_amount').val()
	const result = bnb * (parseInt(basePrice) / 1000000000000000000)

	$('#token_amount').val(result)
}

const updateInformation = async (account) => {
	const price = await launchpad.methods._basePrice().call()
	const currentStage = await launchpad.methods.currentStage().call()
    const dateStart = await launchpad.methods._dateToStart().call()
	const totalBnb = await web3.eth.getBalance(contractAddressLaunchpad)
	const totalParticipant = await launchpad.methods.totalParticipant().call()
	const cap = await launchpad.methods._cap().call()
	const remainingTokens = await launchpad.methods.remainingTokens().call()
	const myBalance = await launchpad.methods.getTokenBalance().call({from: account})

	const tokenSold = await launchpad.methods.totalTokenCommited().call()
	const progress = (totalBnb / web3.utils.toWei("1500")) * 100
	const myRatio = (myBalance === "0") ? 0 : Math.round(myBalance/tokenSold*100)


	if(currentStage === "0") {
		$('.status').html(`Starting at <span class="text-info">${timeConverter(dateStart)}</span>`)
		$('.subscribe').attr('disabled', 'true')
	} else if(currentStage === "1") {
		$('.status').html(`<span class="text-success">Launchpad is running!</span>`)
	} else {
		$('.status').html(`<span class="text-danger">Launchpad is over!</span>`)
		$('.subscribe').attr('disabled', 'true')
	}

	if(myBalance !== "0") {
		$('.subscribe').attr('disabled', 'true')
	}

	basePrice = price
	$('#totalCommited').text(balanceFormater(totalBnb) + " BNB")
	$('#totalParticipant').text(totalParticipant)
	$('#ratio').text(`${(myRatio) < 1 ? parseFloat(myRatio).toFixed(3) : parseFloat(myRatio).toFixed(1)}% (${balanceFormater(myBalance)} of ${balanceFormater(tokenSold)} DOGEX)`)
	$('#progress').css('width', `${(progress < 5) ? 10: parseInt(progress)}%`)
	$('#progress').text(`${parseFloat(progress).toFixed(3)}%`)
	$('#remains').text(`${balanceFormater(remainingTokens)} DOGEX`)

	calcBnbAndToken()
}

const connectBtn = `
<button class="btn btn-danger w-100 fw-semibold connect-btn">Connect</button>
`
const addressText = (address) => {
	return `<p class="text-danger">${address}</p>`
}

$(document).ready(async function() {
	const accounts = await web3.eth.getAccounts()

	updateInformation(accounts[0])

	if(accounts[0] !== undefined) {
		await connectedElement(accounts[0])
	} else {
		$('#connect').html(connectBtn)
	}
})

$('#connect').on('click', '.connect-btn', function() {
	connect()
})

$('#bnb_amount').change(function() {
	calcBnbAndToken()
})

$('.subscribe').click(function() {
	const bnb_commit = $('#bnb_amount').val()
	const token_commit = $('#token_amount').val()

	$('#bnb_commit').text(`${bnb_commit} BNB`)
	$('#token_commit').text(`${token_commit} DOGEX`)
	$('.modal-confirm').modal('show')
})

$('.subscribe-confirm').click(async function() {
	const accounts = await web3.eth.getAccounts()
	const bnb = web3.utils.toWei($('#bnb_amount').val())
	const Toast = Swal.mixin({
	  toast: true,
	  position: 'top-end',
	  showConfirmButton: false,
	  timer: 3000,
	  timerProgressBar: true
	})

	await launchpad.methods.subscribe().send({
		from: accounts[0],
		value: bnb
	}).on('error', function() {
		Toast.fire({
		  icon: 'error',
		  title: 'Transaction is failed'
		})

		$('.modal-confirm').modal('hide')
	}).on('transactionHash', function() {
		Toast.fire({
		  icon: 'success',
		  title: 'Subscription was successfully'
		})

		$('.modal-confirm').modal('hide')
	})
})

const refreshData = setInterval(async function() {
	const accounts = await web3.eth.getAccounts()

	await updateInformation(accounts[0]);
}, 2000);