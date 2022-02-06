//Pagination
const Pagination = ({ items, pageSize, onPageChange }) => {
    const { Button } = ReactBootstrap;
    if (items.length <= 1) return null;
  
    let num = Math.ceil(items.length / pageSize);
    let pages = range(1, num + 1);
    const list = pages.map(page => {
      return (
        <Button key={page} onClick={onPageChange} className="page-item">
          {page}
        </Button>
      );
    });
    return (
      <nav>
        <ul className="pagination">{list}</ul>
      </nav>
    );
  };
  const range = (start, end) => {
    return Array(end - start + 1)
      .fill(0)
      .map((item, i) => start + i);
  };
  function paginate(items, pageNumber, pageSize) {
    const start = (pageNumber - 1) * pageSize;
    let page = items.slice(start, start + pageSize);
    return page;
  }

let theData;

const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);

    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData
    });

    useEffect(() => {
        let didCancel = false;
        const fetchData = async () => {
            dispatch({ type: "FETCH_INIT"});
            try {
                const result = await axios(url);
                if (!didCancel) {
                    dispatch({ type: "FETCH_SUCCESS", payload: result.data});
                    console.log("Success");
                    console.log(result.data.docs);
                    theData = result.data.docs;
                    console.log(`data is ${theData}`);
                }
            } catch (error) {
                if (!didCancel) {
                    dispatch({ type: "FETCH_FAILURE" });
                }
            }
        };
        fetchData();
        return () => {
            didCancel = true;
        };
    }, [url]);
    return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
    switch (action.type) {
        case "FETCH_INIT":
            return {
                ...state,
                isLoading: true,
                isError: false
            };
        case "FETCH_SUCCESS":
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload
            };
            
        case "FETCH_FAILURE":
            return {
                ...state,
                isLoading: false,
                isError: true
            };
        default:
            throw new Error();
    }
};
//A function to hopefully do cover art
function Cover (isbns) {
    if (!isbns.isbns) {
        return null;
    }
    let firstIsbn = isbns.isbns[0];
    return (
        <div>
            <img src={`https://covers.openlibrary.org/b/isbn/${firstIsbn}-M.jpg`}></img>
        </div>
    )
};



//The App that renders into the REACT DOM
function App () {
    const {Fragment, useState, useEffect, useReducer } = React;
    const [query, setQuery] = useState("Gregory Josephs");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
        "https://openlibrary.org/search.json?q=gregory+josephs",
        {
            docs: []
        }
    );
    const handlePageChange = e => {
        setCurrentPage(Number(e.target.textContent));
      };
      let page = data.docs;
      if (page.length >= 1) {
        page = paginate(page, currentPage, pageSize);
        console.log(`currentPage: ${currentPage}`);
      }
    return (
        <Fragment>
            <div className="search-form">
            <form onSubmit={event => {
            doFetch(`https://openlibrary.org/search.json?q=${query}`);

            event.preventDefault()
             }}>
            <input className="search-field" type="text" value={query} onChange={event => setQuery(event.target.value)}/>
            <button className="search-button" type="submit">Search</button>
            </form>
            </div>
        {isError && <div>Something went wrong ...</div>}

        {isLoading ? (
            <div>Loading ...</div>
        ) : (
            <ul>
            {page.map(item => (
            <li key={item.key}>
              <div className="book-card">
                <div>
                <Cover isbns={item.isbn}/>
                </div>
                <div>
                    <h2>{item.title}</h2>
                    {item.author_name.map(author => (
                        <h4 key={author.key}>{author}</h4>
                    ))}
                </div>
              </div>
            </li>
          ))}
            </ul>
        )}
        <Pagination
        items={data.docs}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
        </Fragment>
    )
}
  
  // ========================================
  ReactDOM.render(<App />, document.getElementById("root"));
  