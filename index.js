function	Nodes ({$app, initialState, onClick}) {
	
	this.state = initialState;
	this.$target = document.createElement('div');
	this.$target.className = 'Nodes';
	this.onClick = onClick;
	$app.appendChild(this.$target);

	this.setState = nextState => {
		this.state = nextState;
		this.render();
	}

	this.render = () => {
		const prefix = './assets'

		if (this.state.nodes) {
			const nodesTemplate = this.state.nodes.map(node => {
				const iconPath = node.type === 'FILE' ? prefix + '/file.png' : prefix + '/directory.png'

				return `
					<div class="Node" data-node-id="${node.id}">
						<img src="${iconPath}" />
						<div>${node.name}</div>
					</div>
				`
			}).join('')
			// 바뀌었다면 DOM변경
			this.$target.innerHTML = !this.state.isRoot ? 
									`<div class="Node"><img src="${prefix}/prev.png"></div>${nodesTemplate}` : 
									nodesTemplate
		}
		// Node들에 이벤트 붙여주기
		this.$target.querySelectorAll('.Node').forEach($node => {
			$node.addEventListener('click', (e) => {
				const { nodeId } = e.target.dataset;
				const selectedNode = this.state.nodes.find(node => node.id === nodeId);
				// 선택 된 노드가 존재한다면 이벤트 발생.
				if (selectedNode) {
					this.onClick(selectedNode);
				}
			})
		})
	}

}

function	Breadcrumb({ $app, initialState }) {
	this.state = initialState;
	this.$target = document.createElement('nav');
	this.$target.className = 'Breadcrumb';
	$app.appendChild(this.$target);

	this.setState = nextState => {
		this.state = nextState;
		this.render();
	}

	this.render = () => {
		this.$target.innerHTML = `<div class="nav-item">root</div>${
			this.state.map((node, index) => `<div class="nav-item" data-index="${index}">${node.name}</div>`).join('')
		}`
	}
}

function	App($app) {

	this.state = {
		isRoot: false,
		nodes: [],
		depth: []
	}

	const breadcrumb = new Breadcrumb({
		$app,
		initialState: this.state.depth
	})

	const nodes = new Nodes({
		$app,
		initialState: {
			isRoot: this.state.isRoot,
			nodes: this.state.nodes
		},
		onClick: (node) => {
			if (node.type === 'DIRECTORY') {
				console.log('directory working ... ');
			} else if (node.type === 'FILE') {
				console.log('file working ... ');
			}
		}
	})

	this.setState = (nextState) => {
		this.state = nextState;
		breadcrumb.setState(this.state.depth);
		nodes.setState({
			isRoot: this.state.isRoot,
			nodes: this.state.nodes
		})
	}

	const init = async () => {
		try {
			const rootNodes = await request();
			this.setState({
				...this.state,
				isRoot: true,
				nodes: rootNodes
			})
		} catch (e) {
			throw Error("async error");
		}
	}

	init();
}

const API_END_POINT = 'https://zl3m4qq0l9.execute-api.ap-northeast-2.amazonaws.com/dev';

const request = async (nodeId) => {

	try {
		const res = await fetch(`${API_END_POINT}/${nodeId ? nodeId : ''}`);
		if (!res.ok) {
			throw new Error('Server Error');
		}
		return await res.json();
	} catch (e) {
		throw new Error(`Somthing .. Error.. ${e.message}`);
	}
}

new App(document.querySelector('.app'));