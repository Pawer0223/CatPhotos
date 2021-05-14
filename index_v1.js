class	Nodes {
	constructor({$app, initialState}) {
		this.state = initialState;
		this.$target = document.createElement('ul');
		$app.appendChild(this.$target);
		this.render();
	}

	setState(nextState) {
		this.state = nextState;
		this.render();
	}

	render() {
		this.$target.innerHTML = this.state.nodes.map(node => `<li>${node.name}</li>`)
	}
}

class	Breadcrumb {
	constructor({$app, initialState}) {
		this.state = initialState;
		this.$target = document.createElement('nav');
		this.$target.className = 'Breadcrumb';
		$app.apendChild(this.$target);
	}

	setState(nextState) {
		this.state = nextState;
		this.render();
	}

	render() {
		this.$target.innerHTML = `<div class="nav-item">root</div>${
			this.state.map((node, index) => `<div class="nav-item" data-index="${index}">${node.name}</div>`).join('')
		}`
	}
}

const $app = document.querySelector('.app');

const initialState = {
	nodes: []
};

const nodes = new Nodes({
	$app,
	initialState
});

const nextState = {
	nodes: [
		{
			//...
		}
	]
}

nodes.setState(nextState);