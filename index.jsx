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

// This variable allows me to see inside what is getting fetched so I can look at its structure in the console.
let theData;

const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);

    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData
    });

    // The useEffect causes data to be fetched when the search form is triggered, using various dispatches
    useEffect(() => {
        let didCancel = false;
        // The funtion that actually fetches the data
        const fetchData = async () => {
            dispatch({ type: "FETCH_INIT"}); // Causes the conditional loading div to appear while fetching
            try {
                // Here is where we are catching the data before committing it to state
                const result = await axios(url);
                if (!didCancel) {
                    // When successful, dispatch FETCH_SUCCESS
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

// The following defines the actions of the dispatches given different cases
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
                data: action.payload // set the state of data the be the fetched results
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
//A function to retrieve cover art when available
function Cover (isbns) {
    // If no isbn is available (required for the cover art link), return
    if (!isbns.isbns) {
        return null;
    }
    // When an isbn IS available, grab only the first one in the case of multiple isbns (which is likely)
    let firstIsbn = isbns.isbns[0];
    return (
        <div>
            <img src={`https://covers.openlibrary.org/b/isbn/${firstIsbn}-M.jpg`}></img>
        </div>
    )
};

//A function to return titles
function Title (titles) {
    console.log(titles);
    return (
        <h2>
            {titles.titles}
        </h2>
    );
};



//The App that renders into the REACT DOM
function App () {
    const {Fragment, useState, useEffect, useReducer } = React;
    // The state variables for the search bar
    const [query, setQuery] = useState("Gregory Josephs"); 
    // The state variables for the pagination
    const [currentPage, setCurrentPage] = useState(1); 
    const pageSize = 10;
    // Here we're doing the initial fetch on the first render
    // docs is, according to Open Library, where all the data I want from the fetch is stored within the retrieved object
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
        "https://openlibrary.org/search.json?q=gregory+josephs",
        {
            docs: []
        }
    );
    // The function that handles the page change when buttons at the bottom of the page are clicked
    const handlePageChange = e => {
        setCurrentPage(Number(e.target.textContent));
      };
      // Grabbing the data (in docs) so it  can be passed to the paginate function to render out the corresponding page
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
        {/* Conditional div to show when there is an error */}
        {isError && <div>Something went wrong ...</div>}
        {/* Conditional div to show when data is still fetching */}
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
                    <Title titles={item.title}/>
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
  