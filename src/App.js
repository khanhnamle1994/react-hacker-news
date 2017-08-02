import React from 'react';
import { compose } from 'recompose';

import './App.css';

const applyUpdateResult = (result) => (prevState) => ({
  hits: [...prevState.hits, ...result.hits],
  page: result.page,
  isLoading: false,
});

const applySetResult = (result) => (prevState) => ({
  hits: result.hits,
  page: result.page,
  isLoading: false,
});

const getHackerNewsUrl = (value, page) =>
  `https://hn.algolia.com/api/v1/search?query=${value}&page=${page}&hitsPerPage=100`;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hits: [],
      page: null,
      isLoading: false,
    };
  }

  onInitialSearch = (e) => {
    e.preventDefault();

    const { value } = this.input;

    if (value === '') {
      return;
    }

    this.fetchStories(value, 0);
  }

  onPaginatedSearch = (e) =>
    this.fetchStories(this.input.value, this.state.page + 1);

    fetchStories = (value, page) => {
      this.setState({ isLoading: true });
      fetch(getHackerNewsUrl(value, page))
        .then(response => response.json())
        .then(result => this.onSetResult(result, page));
    }

  onSetResult = (result, page) =>
    page === 0
      ? this.setState(applySetResult(result))
      : this.setState(applyUpdateResult(result));

  render() {
    return (
      <div className="page">
        <div className="interactions">
          <form type="submit" onSubmit={this.onInitialSearch}>
            <input type="text" ref={node => this.input = node} />
            <button type="submit">Search</button>
          </form>
        </div>

        <ListWithLoadingWithPaginated
          list={this.state.hits}
          isLoading={this.state.isLoading}
          page={this.state.page}
          onPaginatedSearch={this.onPaginatedSearch}
        />
      </div>
    );
  }
}

// React ES6 class component
class List extends React.Component {
  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, false);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll, false);
  }

  onScroll = () => {
    if (
      (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500) &&
      this.props.list.length
    ) {
      this.props.onPaginatedSearch();
    }
  }
  
  render() {
    const { list } = this.props;
    return (
      <div className="list">
        {list.map(item => <div className="list-row" key={item.objectID}>
          <a href={item.url}>{item.title}</a>
        </div>)}
      </div>
    );
  };
}

const withLoading = (Component) => (props) =>
  <div>
    <Component {...props} />

    <div className="interactions">
      {props.isLoading && <span>Loading...</span>}
    </div>
  </div>

const withPaginated = (Component) => (props) =>
  <div>
    <Component {...props} />

    <div className="interactions">
      {
        (props.page !== null && !props.isLoading) &&
        <button
          type="button"
          onClick={props.onPaginatedSearch}
        >
          More
        </button>
      }
    </div>
  </div>

  const ListWithLoading = compose(
    withLoading,
  )(List);

export default App;
