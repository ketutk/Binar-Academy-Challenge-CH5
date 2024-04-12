const app = require("../index");
const { accountsTest } = require("./accounts.tests");
const { authTests } = require("./auth.tests");
const { middlewareTests } = require("./middleware.tests");
const { transactionsTests } = require("./transaction.tests");
const { usersTests } = require("./users.tests");

// MEMBUAT TEST BERJALAN SECARA BERURUTAN(TIDAK PARAREL) AGAR TIDAK TERJADI BENTROKAN SAAT AKSES DATABASE
describe(`Test run sequentially`, () => {
  describe("\nAUTH TEST================================================\n", () => {
    authTests(app);
  });
  describe("\nUSERS TEST===============================================\n", () => {
    usersTests(app);
  });
  describe("\nACCOUNTS TEST============================================\n", () => {
    accountsTest(app);
  });
  describe("\nTRANSACTIONS TEST========================================\n", () => {
    transactionsTests(app);
  });
  describe("\nMIDDLEWARE TEST==========================================\n", () => {
    middlewareTests(app);
  });
});
