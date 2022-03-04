App = {
	web3Provider: null,
	contracts: {},

	init: async () => {
		// Load pets.
		$.getJSON('../pets.json', function (data) {
			const petsRow = $('#petsRow');
			const petTemplate = $('#petTemplate');

			for (i = 0; i < data.length; i++) {
				petTemplate.find('.panel-title').text(data[i].name);
				petTemplate.find('img').attr('src', data[i].picture);
				petTemplate.find('.pet-breed').text(data[i].breed);
				petTemplate.find('.pet-age').text(data[i].age);
				petTemplate.find('.pet-location').text(data[i].location);
				petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

				petsRow.append(petTemplate.html());
			}
		});

		return await App.initWeb3();
	},

	initWeb3: async () => {
		if (window.ethereum) {
			App.web3Provider = window.ethereum;
			try {
				await window.ethereum.request({
					method: 'eth_requestAccounts',
				});
			} catch (error) {
				console.error('User denied account access');
			}
		} else if (window.web3) {
			App.web3Provider = window.web3.currentProvider;
		} else {
			App.web3Provider = new Web3.providers.HttpProvider(
				'http://localhost:7545'
			);
		}
		web3 = new Web3(App.web3Provider);
		return App.initContract();
	},

	initContract: () => {
		$.getJSON('Adoption.json', function (data) {
			const AdoptionArtifact = data;
			App.contracts.Adoption = TruffleContract(AdoptionArtifact);
			App.contracts.Adoption.setProvider(App.web3Provider);
			return App.markAdopted();
		});
		return App.bindEvents();
	},

	bindEvents: () => {
		$(document).on('click', '.btn-adopt', App.handleAdopt);
	},

	markAdopted: () => {
		let adoptionInstance;
		App.contracts.Adoption.deployed()
			.then(function (instance) {
				adoptionInstance = instance;
				return adoptionInstance.getAdopters.call();
			})
			.then((adopters) => {
				for (i = 0; i < adopters.length; i++) {
					if (
						adopters[i] !==
						'0x0000000000000000000000000000000000000000'
					) {
						$('.panel-pet')
							.eq(i)
							.find('button')
							.text('Success')
							.attr('disabled', true);
					}
				}
			})
			.catch((err) => {
				console.log(err);
			});
	},

	handleAdopt: (event) => {
		event.preventDefault();

		const petId = parseInt($(event.target).data('id'));

		let adoptionInstance;
		web3.eth.getAccounts((error, accounts) => {
			if (error) {
				console.log(error);
			}
			const account = accounts[0];
			App.contracts.Adoption.deployed()
				.then((instance) => {
					adoptionInstance = instance;
					return adoptionInstance.adopt(petId, { from: account });
				})
				.then((res) => {
					console.log(res);
					return App.markAdopted();
				})
				.catch((err) => {
					console.error(err);
				});
		});
	},
};

$(() => {
	$(window).load(() => {
		App.init();
	});
});
