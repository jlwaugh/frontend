import { QUERY_SET } from '../actions/query'
import { CONSOLE_SET_TOP_PANEL, CONSOLE_SET_BOTTOM_PANEL, CONSOLE_SET_CHART_OPTIONS } from '../actions/console'

const initialState = {
	topPanelIndex : 0,
	bottomPanelIndex: 2,

	namespace : "",
	query : "",
	chartOptions : {
		type : 'line',
		title : 'results',
		xIndex : 0,
		yIndex : 0,
	}
}

export default function consoleReducer (state=initialState, action) {
	switch (action.type) {
		case QUERY_SET:
			return Object.assign({}, state, { query : action.value });
		case CONSOLE_SET_TOP_PANEL:
			return Object.assign({}, state, { topPanelIndex : action.value });
		case CONSOLE_SET_BOTTOM_PANEL:
			return Object.assign({}, state, { bottomPanelIndex : action.value });
		case CONSOLE_SET_CHART_OPTIONS:
			return Object.assign({}, state, { chartOptions : action.value });
	}

	return state;
}