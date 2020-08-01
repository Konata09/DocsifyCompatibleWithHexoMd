This tool make docsify compatible with Hexo markdown file. You could move your blog(or documentation) from hexo to docsify with no need to change your markdown file.

## Usage

First, you should turn on `loadSidebar` option following [docsify's documentation](https://docsify.js.org/#/more-pages).  

Then, put `genSidebar.mjs` in a folder which contain Hexo markdown files. run `node genSidebar.mjs` and your you will get `_sidebar.md` .  

Last, to prevent Front-Matter rendered in the page, you need to add a hook to docsify  :

``` js
let reg = /^---[\r\n](.|[\r\n])*[\r\n]---[\r\n]/;
hook.beforeEach(function(content) {
    con = content.replace(reg, '')
    return con;
});
```

your script in `index.html` should like this:  

``` html
<script>
    window.$docsify = {
        loadSidebar: true,
        plugins: [
            function(hook) {
                let reg = /^---[\r\n](.|[\r\n])*[\r\n]---[\r\n]/;
                hook.beforeEach(function(content) {
                    con = content.replace(reg, '')
                    return con;
                });
            }
        ]
    }
</script>
```

enjoy!
