export default function	Nodes ({$app, initialState, onClick, onBackClick}) {
	
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