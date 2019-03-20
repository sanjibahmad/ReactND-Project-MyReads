import React from "react";
import { Route } from "react-router-dom";
import * as BooksAPI from "./BooksAPI";
import ListBookShelves from "./components/ListBookShelves";
import SearchBooks from "./components/SearchBooks";
import Message from "./components/Message";
import Shelf from "./models/Shelf";
import "./App.css";

class BooksApp extends React.Component {
  state = {
    books: [],
    booksQueriedWithShelfStatus: [],
    message: Message.empty
  };

  emptyMessage = () => {
    this.setState({ message: Message.empty });
  };

  emptyQueriedBooks = () => {
    this.setState({ booksQueriedWithShelfStatus: [] });
  };

  updateMessage = (content, type) => {
    this.setState({ message: { content: content, type: type } });
  };

  moveBookToShelf = (targetBook, targetShelfName) => {
    const existingBook = this.state.books.find(
      book => book.id === targetBook.id
    );
    if (existingBook) {
      this.setState(({ books }) => ({
        books: books.map(book => {
          if (book.id === targetBook.id) {
            this.updateBook(book, targetShelfName);
            book.shelf = targetShelfName;
          }
          return book;
        })
      }));
    } else {
      this.setState(({ books }) => {
        this.updateBook(targetBook, targetShelfName);
        targetBook.shelf = targetShelfName;
        books.push(targetBook);
        return { books: books };
      });
    }
  };

  updateBook = (book, shelfName) => {
    BooksAPI.update(book, shelfName).then(result => {
      if (
        result[shelfName] &&
        result[shelfName].find(bookResultId => bookResultId === book.id)
      ) {
        this.setState({
          message: {
            content: `Moved ${book.title} to ${Shelf.getLabelFromKey(
              shelfName
            )}`,
            type: Message.type.positive
          }
        });
      } else {
        this.setState({
          message: {
            content: `Removed ${book.title} from shelf.`,
            type: Message.type.positive
          }
        });
      }
      this.updateBooksQueriedWithShelfStatus();
    });
  };

  updateBooksQueriedWithShelfStatus(
    queriedBooks = this.state.booksQueriedWithShelfStatus
  ) {
    const booksQueriedWithShelfStatus = queriedBooks.map(queriedBook => {
      const bookInShelf = this.state.books.find(
        book => book.id === queriedBook.id
      );
      queriedBook.shelf = bookInShelf ? bookInShelf.shelf : Shelf.keys.none;
      return queriedBook;
    });
    console.log("will update booksQueriedWithShelfStatus");
    this.setState({
      booksQueriedWithShelfStatus: booksQueriedWithShelfStatus
    });
    // this.setState({
    //   booksQueriedWithShelfStatus: booksQueriedWithShelfStatus,
    //   message: {
    //     content: `Found ${result.length} books on ${searchTerm}`,
    //     type: Message.type.positive
    //   }
    // });
  }

  queryBook = searchTerm => {
    if (searchTerm.trim() === "") {
      this.setState({
        booksQueriedWithShelfStatus: [],
        message: Message.empty
      });
      return;
    }
    this.setState({
      booksQueriedWithShelfStatus: [],
      message: {
        content: `Searching for '${searchTerm}'`,
        type: Message.type.loading
      }
    });
    BooksAPI.search(searchTerm)
      .then(result => {
        if (result.error) {
          this.setState({
            message: {
              content: `Could not find any book for '${searchTerm}'`,
              type: Message.type.negative
            }
          });
        } else if (result) {
          this.updateBooksQueriedWithShelfStatus(result);
          this.setState({
            message: {
              content: `Found ${result.length} books on ${searchTerm}`,
              type: Message.type.positive
            }
          });
        }
      })
      .catch(() => {
        this.setState({
          message: {
            content: `Could not find any book for: '${searchTerm}'`,
            type: Message.type.negative
          }
        });
      });
  };

  componentDidMount() {
    BooksAPI.getAll().then(books => {
      this.setState({ books: books });
    });
  }

  render() {
    return (
      <div className="app">
        <Route
          exact
          path="/"
          render={history => {
            // console.log("in /", history);
            return (
              <ListBookShelves
                books={this.state.books}
                moveBookToShelf={this.moveBookToShelf}
                message={this.state.message}
                updateMessage={this.updateMessage}
                emptyMessage={this.emptyMessage}
              />
            );
          }}
        />
        <Route
          path="/search"
          render={history => {
            // console.log("in /search", history);
            return (
              <SearchBooks
                books={this.state.booksQueriedWithShelfStatus}
                moveBookToShelf={this.moveBookToShelf}
                queryBook={this.queryBook}
                message={this.state.message}
                updateMessage={this.updateMessage}
                emptyMessage={this.emptyMessage}
                emptyQueriedBooks={this.emptyQueriedBooks}
              />
            );
          }}
        />
      </div>
    );
  }
}

export default BooksApp;
