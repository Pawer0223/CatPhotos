import ImageView from './ImageView.js'
import Breadcrumb from './Breadcrumb.js'
import Nodes from './Nodes.js'
import { request } from './api.js'

export default function App($app) {

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
				new Error('Prev Error');
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
			throw Error("async error");
		}
	}
	init();
}