import React, { Component } from "react";
import Shelf from "../models/Shelf";
import Book from "../models/Book";

class BookDetails extends Component {
  render() {
    const book = new Book(this.props.book);
    return (
      <div className="book">
        <div className="book-top">
          <div
            className="book-cover"
            style={{
              width: 128,
              height: 193,
              backgroundImage: `url("${book.imageLinks.thumbnail}")`
            }}
          />
          <div className="book-shelf-changer">
            <select>
              <option value="move" disabled>
                Move to...
              </option>
              <option value={Shelf.keys.currentlyReading}>
                Currently Reading
              </option>
              <option value={Shelf.keys.wantToRead}>Want to Read</option>
              <option value={Shelf.keys.read}>Read</option>
              <option value={Shelf.keys.none}>None</option>
            </select>
          </div>
        </div>
        <div className="book-title">{book.getFullTitle()}</div>
        <div className="book-authors">{book.getAuthors()}</div>
      </div>
    );
  }
}

export default BookDetails;
