import React from 'react';
import { requestInvoice } from '../../services/api';
import { QRCode } from 'react-qr-svg';

export class HomeScene extends React.Component {
  constructor() {
    super();
    this.state = {
      line1: '',
      line2: '',
      line3: '',
      invoice: null,
    };
    this.requestInvoice = this.requestInvoice.bind(this);
  }

  render() {
    return (
      <div className="home">
        <div className="header-section">
          <a href="/">
            <img className="logo" src="/public/img/logo-large.png" />
          </a>
          <div className="header-text">
            <h1 className="title">Block Clock Live</h1>
            <div className="lead">
              Change the <a href="http://getblockclock.com/">BlockClock</a>&trade; display with the
              Lightning Network!
            </div>
          </div>
        </div>
        <div className="video-section">
          <div className="video-container">
            <iframe
              src="https://player.twitch.tv/?channel=altangent"
              frameBorder="0"
              allowFullScreen="false"
              scrolling="no"
              height="500"
              width="800"
            />
            <div className="share-links">
              <a
                href="https://twitter.com?status=I%20wrote%20on%20a%20BlockClock%20https%3A//blockclock.live/%0A%40theBlockClock%20%40altangent"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/public/img/twitter-logo.png" />
              </a>
            </div>
          </div>
        </div>
        <div className="payment-section">
          <div className="container">
            <div className="row">
              <div className="col-md form-area">
                <h2 className="title">Write a message...</h2>
                <div className="row">
                  <div className="col-lg pr-0">
                    <div className="step">
                      <span className="label">Step 1: </span>
                      <span className="content">Enter up to 8 characters per line</span>
                    </div>
                    <div className="step">
                      <span className="label">Step 2: </span>
                      <span className="content">Pay the Lighting Network invoice</span>
                    </div>
                    <div className="step">
                      <span className="label">Step 3:</span>
                      <span className="content">Updates when the invoice has been settled!</span>
                    </div>
                  </div>
                  <div className="col-lg">
                    <form className="line-form">
                      {this.renderInput(1)}
                      {this.renderInput(2)}
                      {this.renderInput(3)}
                      <div>
                        <button className="btn btn-primary" onClick={this.requestInvoice}>
                          Create Invoice
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-md">
                {this.state.invoice && (
                  <div className="invoice">
                    <h2 className="title">Pay the invoice...</h2>
                    <div className="qr-code">
                      <QRCode
                        style={{ width: 256 }}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        level="L"
                        value={this.state.invoice.payment_request}
                      />
                    </div>
                    <div className="price">
                      Cost: {this.state.invoice.value}sat / ${this.state.invoice.usdValue}
                    </div>
                    <div className="payment-request">{this.state.invoice.payment_request}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="row node-address">
              <div className="col">
                <div className="msg">Connect to our Lightning Network node:</div>
                <div className="address">
                  03df257120256b5f0b87d25659946d42067a094c765bff830eb66d6ffba6f4d5da@38.87.54.164:9735
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderInput(line) {
    return (
      <div className="form-group">
        <input
          type="text"
          className="form-control"
          maxLength="8"
          placeholder={'Line ' + line}
          value={this.state['line' + line]}
          onChange={e => this.changeLine(line, e.target.value)}
        />
      </div>
    );
  }

  changeLine(line, value) {
    this.setState({ ['line' + line]: value });
  }

  requestInvoice(e) {
    e.preventDefault();
    let lines = [this.state.line1, this.state.line2, this.state.line3];
    requestInvoice(lines)
      .then(i => this.receivedInvoice(i))
      .catch(console.error);
  }

  receivedInvoice(invoice) {
    this.setState({ invoice, line1: '', line2: '', line3: '' });
  }
}
