function	Nodes ({$app, initialState, onClick, onBackClick}) {
	
	this.state = initialState;
	this.$target = document.createElement('div');
	this.$target.className = 'Nodes';
	this.onClick = onClick;
	this.onBackClick = onBackClick;

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
				const nodeId = e.currentTarget.dataset.nodeId;
				// prev누른 경우, nodeId가 없다면 prev를 누른거임.
				if (!nodeId) {
					this.onBackClick();
				}
				const selectedNode = this.state.nodes.find(node => node.id === nodeId);
				// 선택 된 노드의 onClick함수 수행.
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

const IMAGE_PATH_PREFIX = 'https://fe-dev-matching-2021-03-serverlessdeploymentbuck-t3kpj3way537.s3.ap-northeast-2.amazonaws.com/public';

function	ImageView({$app, initialState}) {
	this.state = initialState;
	this.$target = document.createElement('div');
	this.$target.className = "Modal";
	this.$target.addEventListener("keydown", (e) => {
		console.log(e);
	})
	this.$target.addEventListener('click', (e) => {
		if (e.target === e.currentTarget) {
			this.$target.style.display = 'none';
			isOpen = false;
		}
	})
	$app.appendChild(this.$target);
	this.setState = (nextState) => {
		this.state = nextState;
		this.render();
	}
	this.render = () => {
		this.$target.innerHTML =
		`<div class="content">${this.state ? `<img src="${IMAGE_PATH_PREFIX}${this.state}">` : ''}</div>`
		this.$target.style.display = this.state ? 'block' : 'none';
		isOpen = true;
	}
	// modalOpen이 false이면 esc키 이벤트 안먹히도록, true이면 먹히도록

	// ImageView의 render가 호출되면서 block으로 바뀔 때, modalOepn의 상태를 true로 변경 함.

	// 이후 ESC or Click하면 false 로 바뀌어야 함
}

function	App($app) {

	this.state = {
		isRoot: false,
		nodes: [],
		depth: [],
		selectedFilePath: null
	}

	const imageView = new ImageView({
		$app,
		initialState: this.state.selectedNodeImage
	})

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
		onClick: async (node) => {
			try {
				if (node.type === 'DIRECTORY') {
					const nextNodes = await request(node.id);
					this.setState({
						...this.state,
						isRoot: false,
						depth: [...this.state.depth, node],
						nodes: nextNodes
					})
				} else if (node.type === 'FILE') {
					this.setState({
						...this.state,
						selectedFilePath: node.filePath
					})
				}
			} catch(e) {
				new Error('somthing error');
			}
		},
		onBackClick: async () => {
			try {
				// 이전 상태를 복사.
				const nextState = { ...this.state };
				// 현지 디렉토리를 빼기.
				nextState.depth.pop();
				// root면 null, 아니면 가장 마지막 요소
				const prevNodeId = nextState.depth.length === 0 ? null : nextState.depth[nextState.depth.length - 1].id
				if (prevNodeId === null) {
					const rootNodes = await request();
					this.setState({
						...nextState,
						isRoot: true,
						nodes: rootNodes
					})
				} else {
					const prevNodes = await request(prevNodeId);

					this.setState({
						...nextState,
						isRoot: false,
						nodes: prevNodes
					})
				}
			} catch(e) {
				new Error(e.message);
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
		imageView.setState(this.state.selectedFilePath)
	}
	const init = async () => {
		try {
			const rootNodes = await request();
			this.setState({
				...this.state,
				isRoot: true,
				nodes: rootNodes
			});
		} catch (e) {
			throw Error(e.message);
		}
	}
	init();
}

const API_END_POINT = 'https://zl3m4qq0l9.execute-api.ap-northeast-2.amazonaws.com/dev';
let isOpen = false;

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

window.addEventListener('keydown', (e) => {
	if (isOpen) {
		if (e.key === 'Escape')
		document.querySelector('.Modal').style.display = 'none';
		isOpen = false;
	}
})

new App(document.querySelector('.app'));