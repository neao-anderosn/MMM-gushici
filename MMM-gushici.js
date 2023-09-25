Module.register("MMM-gushici", {

    // Module config defaults.
    defaults: {
        updateInterval: 3*60*1000,
        fadeSpeed: 4000,
        url: "http://v1.jinrishici.com/all.json",
        authorAlign: "align-right",
        words: [{
            content: "去年今日此门中，人面桃花相映红。",
            origin: "题都城南庄",
            author:"崔护"
        }, {
            content: "十年生死两茫茫，不思量，自难忘。",
            origin: "江城子·乙卯正月二十日夜记梦",
            author: "苏轼"
        }],
        maxQuantity: 20,
        lineBreak: false
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.lastWord = "";
        var self = this;

        // Schedule update timer.
        setInterval(function() {
            self.getJson();
        }, this.config.updateInterval);

    },

    socketNotificationReceived: function(notification, payload) {
        // 收取json反馈
        if (notification === "getJson_r") {
            // 测试
            Log.error(1,"【古诗词】", "收到payload" + payload);
            // 如果payload有效：content开始，大于30字
            if (payload.indexOf("content") != 0 && payload.length > 30) {
                // 如果超过限定缓存数量，删除第一个
                if (this.config.words.length > this.config.maxQuantity) {
                    this.config.words.shift()
                };
                Log.error(1,this.name, payload);
                thisJson = JSON.parse(payload);
                // 遍历缓存，如果存在就不添加
                for (word of this.config.words){
                    if (thisJson.content == word.content){
                        return;
                    }
                }
                this.config.words.push(thisJson);
                this.updateDom(this.config.fadeSpeed);
            }
        }
    },
    // 发送获取诗词指令
    getJson: function() {
        this.sendSocketNotification("getJson_s", this.config.url)
    },

    // 随机获取一句不重复的诗词
    getRandom: function() {
        words = this.config.words;
        word = words[Math.floor(Math.random() * words.length)];
        // 避免重复
        while (word.content == this.lastWord){
            word = words[Math.floor(Math.random() * words.length)]
        }
        this.lastWord = word.content;
        return word;
    },

    // dom 生成器。
    getDom: function() {
        var wrapper = document.createElement("div");
        let {content, origin,author,category} = this.getRandom();
        // 测试
        Log.error(1,"【古诗词】", "随机获取：" + content+ origin+author+category);
        this.getJson();
        var spw = document.createElement("div");
        spw.className = "thin xmedium bright pre-line";
        if (this.config.lineBreak){
            if (content.indexOf("\n") == -1){
                content = content.replace(/([，。？！])/g, "$1\n");
            }
            content = content.replace(/(\n+)/g, "\n").replace(/(\n$)/, "");
        }
        Log.error(3, this.name, content, source);
        var parts = content.split("\n");
        for (part of parts){
            spw.appendChild(document.createTextNode(part));
            spw.appendChild(document.createElement("BR"));
        }
        wrapper.appendChild(spw);
        var spa = document.createElement("div");
        spa.className = this.config.authorAlign ? "small " + this.config.authorAlign : "small";
        spa.appendChild(document.createTextNode("————" + author +"《" + origin +"》"));
        wrapper.appendChild(spa);
        return wrapper;
    },
});
