import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import { debounce } from 'lodash';

import { setQuery, runQuery, loadQueryBySlug, loadQueryPage } from '../actions/query';
import { setTopPanel, setBottomPanel, setChartOptions } from '../actions/console';
import { loadDatasets, loadDataset } from '../actions/dataset';
import { selectDatasetByQueryString } from '../selectors/dataset';

import TabPanel from '../components/TabPanel';
import QueryEditor from '../components/QueryEditor';
import DataTable from '../components/DataTable';
// import ResultsChart from '../components/ResultsChart';
import List from '../components/List';
import DatasetItem from '../components/item/DatasetItem';
import QueryHistoryItem from '../components/item/QueryHistoryItem';
import QueryItem from '../components/item/QueryItem';
import Datasets from './Datasets';

function loadData(props) {
  props.loadDatasets(1, 100);
}

class Console extends React.Component {
  constructor(props) {
    super(props);
    [
      'handleRunQuery',
      'handleDownloadQuery',
      'handleEditorChange',
      'handleSetTopPanel',
      'handleSetBottomPanel',
      'handleSetChartOptions',
      'handleSelectDataset',
      'handleSelectHistoryEntry',
      'handleQuerySelect',
      'handleLoadMoreResults',
    ].forEach((m) => { this[m] = this[m].bind(this); });

    // this.debouncedSetQuery = debounce(props.setQuery, 200)
  }

  componentWillMount() {
    loadData(this.props);
    if (this.props.slug) {
      // this.props.loadQueryBySlug(this.props.slug, [], true);
    }
  }

  componentWillReceiveProps(nextProps) {
    // loadData(nextProps);
    if (nextProps.slug != this.props.slug) {
      // this.props.loadQueryBySlug(nextProps.slug, [], true);
      this.props.setBottomPanel(0);
    }
  }

  handleRunQuery(e) {
    e.preventDefault();
    // this.props.runQuery({
    //   query: this.props.query.,
    //   page: 1,
    // });
    this.props.runQuery(this.props.query);
  }

  handleDownloadQuery(e) {
    e.preventDefault();
    this.props.runQuery({
      query: this.props.query,
      download: true,
    });
  }

  handleEditorChange(value) {
    // this.debouncedSetQuery(value);
    this.props.setQuery(value);
  }
  handleEditorAddressChange(value) {
    this.props.setQueryAddress(value);
  }

  handleSetTopPanel(index) {
    this.props.setTopPanel(index);
  }

  handleSetBottomPanel(index) {
    this.props.setBottomPanel(index);
  }

  handleSetChartOptions(options) {
    this.props.setChartOptions(options);
  }

  handleSelectDataset(i, dataset) {
    this.props.loadDataset(dataset.id, ['schema']);
  }

  handleSelectHistoryEntry(i, query) {
    this.props.setTopPanel(0);
    this.props.setQuery(query);
  }

  handleQuerySelect(i, query) {
    this.props.setTopPanel(0);
    this.props.setQuery(query);
  }

  handleLoadMoreResults() {
    this.props.runQuery({
      queryString: this.props.query,
      page: (this.props.results.pageCount + 1),
    });
  }

  render() {
    const { queries, datasets, datasetRef, data, query, topPanelIndex, bottomPanelIndex, queryHistory, chartOptions, layout } = this.props;
    
    return (
      <div id="console">
        <div className="top container">
          <div className="col-md-12 ">
            <TabPanel
              index={topPanelIndex}
              onSelectPanel={this.handleSetTopPanel}
              labels={['Editor', 'History']}
              components={[
                <QueryEditor name="editor" query={query} onRun={this.handleRunQuery} onDownload={this.handleDownloadQuery} onChange={this.handleEditorChange} />,
                <List className="queryHistory list" data={queryHistory} component={QueryHistoryItem} onSelectItem={this.handleSelectHistoryEntry} />,
              ]}
            />
          </div>
        </div>
        <div className="bottom">
          <div className="container">
            <div className="col-md-12">
              <TabPanel
                index={bottomPanelIndex}
                labels={['Data', 'Chart', 'Datasets', 'Queries']}
                onSelectPanel={this.handleSetBottomPanel}
                components={[
                  <DataTable
                    fields={datasetRef && datasetRef.dataset && datasetRef.dataset.structure && datasetRef.dataset.structure.schema.fields}
                    data={data} 
                    onLoadMore={this.handleLoadMoreResults}
                  />,
                  <h3>TODO - restore results chart</h3>,
                  /* <ResultsChart options={chartOptions} onOptionsChange={this.handleSetChartOptions} layout={layout} />, */
                  /*<List data={datasets} component={DatasetItem} onSelectItem={this.handleSelectDataset} />, */
                  <Datasets />,
                  <List className="queryItem list" data={queries} component={QueryItem} onSelectItem={this.handleQuerySelect} />,
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Console.propTypes = {
  // query slug to load to
  slug: PropTypes.string,

  query: PropTypes.object.isRequired,

  // dataset: PropTypes.array,
  queries: PropTypes.array,
  datasets: PropTypes.array,
  results: PropTypes.object,
  queryHistory: PropTypes.array,
  topPanelIndex: PropTypes.number.isRequired,
  bottomPanelIndex: PropTypes.number.isRequired,
  layout: PropTypes.object.isRequired,

  setQuery: PropTypes.func.isRequired,
  runQuery: PropTypes.func.isRequired,
  setTopPanel: PropTypes.func.isRequired,
  setBottomPanel: PropTypes.func.isRequired,
  // loadDatasets: PropTypes.func.isRequired,
  loadDataset: PropTypes.func.isRequired,
};

Console.defaultProps = {
  hasMoreResults: false,
  nextResultsPage: 1,
};

function mapStateToProps(state, ownProps) {
  // const results = state.results[state.console.query.queryString];
  const datasetRef = state.entities.datasets[state.console.queryResults];
  let data;

  if (datasetRef) {
    data = state.entities.data[datasetRef.path] && state.entities.data[datasetRef.path].data;
  }

  return Object.assign({}, {
    slug: ownProps.location.query.slug,

    queries: Object.keys(state.entities.queries).map(key => state.entities.queries[key]),
    datasets: Object.keys(state.entities.datasets).map(key => state.entities.datasets[key]),
    queryHistory: state.session.history,
    layout: state.layout,

    datasetRef,
    data,

    // results,
  }, state.console, ownProps);
}

export default connect(mapStateToProps, {
  setQuery,
  runQuery,
  loadQueryPage,
  loadQueryBySlug,

  setTopPanel,
  setBottomPanel,
  setChartOptions,

  loadDatasets,
  loadDataset,
})(Console);

