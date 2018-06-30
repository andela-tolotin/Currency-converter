class CurrencyConverter {
  constructor() {
    this.registerWorker();
    this.openDb();
    this.fetchCurrency();
  }

  fetchCurrency() {
    fetch('https://free.currencyconverterapi.com/api/v5/currencies')
      .then((response) => response.json())
      .then((myJson) => {
        console.log(myJson);
      });
  }

  openDb() {
    let dbPromise = idb.open('currency-db', 1, (upgradeDb) => {
      let currency = upgradeDb.createObjectStore('currencies', {
        keyPath: 'id'
      });
      currency.createIndex('id', 'id');
    });
  }

  registerWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () =>
        navigator.serviceWorker.register('serviceWorker.js')
      );
    }

    window.addEventListener('online', function () {
      document.querySelector('.connectivity-status').innerText = 'online';
    })

    window.addEventListener('offline', function () {
      document.querySelector('.connectivity-status').innerText = 'offline';
    });
  }

  save(currencies) {
    this.dbPromise.then((db) => {
      if (!db) return;

      let tx = db.transaction('currencies', 'readwrite');
      let store = tx.objectStore('currencies');

      currencies.array.forEach(currency => {
        store.put(currency, currency.id);
      });

      // limit store to 1600 items
      store.index('id').openCursor(null, "prev").then(cursor => {
        return cursor.advance(160);
      }).then(function deleteRest(cursor) {
        if (!cursor) return;
        cursor.delete();
        return cursor.continue().then(deleteRest);
      });
    });
  }
}

(function () {
  var converter = new CurrencyConverter();
})();