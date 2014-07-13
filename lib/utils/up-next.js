var upNext = [];

module.exports = {
    get : function() {
        console.log(upNext);
        upNext = upNext || [];
        return upNext.shift();
    },

    put : function(val) {
        upNext = upNext || [];
        upNext.push(val);

        console.log(upNext);
    }
};
