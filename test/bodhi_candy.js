const BodhiCandy = artifacts.require("../contracts/BodhiCandy.sol");

contract('BodhiCandy', function(accounts) {
  it("should assert true", function(done) {
    var bodhi_candy = BodhiCandy.deployed();
    assert.isTrue(true);
    done();
  });
});
