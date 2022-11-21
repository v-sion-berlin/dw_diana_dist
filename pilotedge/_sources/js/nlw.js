/**
 * NLW Tool data handler.
 * 
 * @version: 1.3.3
 * @author Deutsche Welle <mps-gs@dw.com>
 * 
 * This module contains various methods to load and handle data from nlw tool.
 * To get started call <code>nlw.data</code>.
 * 
 * To use nlw.data as instance simply use
 * <code>Object.create(nlw.data)</code>.
 * 
 * @namespace nlw
 */
var nlw;
(function (nlw) {
    /**
     * Class request.
     * @class request
     */
    var request = (function() {
        function request() {
            const $project = {
                'url': 'https://bviz-web11-live/pilotedge/index.php',   // fallback url
                'root': 'pilotedge',                                    // project root
                'index': 'index.php'                                    // index file
            };
        
            this.baseUrl = project_location($project);
            this.urlGetParameter = build_query({
                'p': 'nlw.api',     // request page
                'm': 'json',        // output format
                'f': 'nlw/'         // nlw root
            });
        };
        
        /**
         * Get project location.
         * @param {Object} $project
         * @returns {String}
         */
        var project_location = function($project) {
            var $thisScriptUrl;
            // Get script location
            try { $thisScriptUrl = document.currentScript.src; } catch (_) { 
                console.log('document.currentScript is not supported in this browser.'); 
            };
            if (!$thisScriptUrl) {
                var $scripts = document.getElementsByTagName('script');
                if ($scripts.length) $thisScriptUrl = $scripts[$scripts.length-1].src;
            };            
            if (!$thisScriptUrl || $thisScriptUrl.length === 0) return $project.url;
            
            var $urlPartsRemove = [];
            var $url = $thisScriptUrl.split('/');
            // Pretty ugly foreach loop with break
            var $breakException = {};
            try {
                $url.reverse().forEach(function($el) {
                    if ($el === $project.root) throw $breakException;
                    $urlPartsRemove.push($el);
                });
            } catch ($e) {
                if ($e !== $breakException) return $project.url;
            };
            // Get project root
            return $thisScriptUrl.replace(($urlPartsRemove.reverse()).join('/'), '')+$project.index;
        };
        
        /**
         * Build url encoded query.
         * @param {object} $json
         * @returns {String}
         */
        var build_query = function($json) {
            const $out = [];
            for (let $d in $json)
                $out.push(encodeURIComponent($d) + '=' + encodeURIComponent($json[$d]));
            return $out.join('&');
        };

        /**
         * Check string is url.
         * @param {String} $str
         * @returns {Boolean}
         */
        var is_url = function($str) {
            let $url;
            try { $url = new URL($str); } catch (_) { return false; };
            return true;
        };

        /**
         * Requester.
         * @param {String} $url
         * @returns {Array|Object}
         */
        request.prototype.load = function($url) {
            // if a file is passed, create valid request url
            if (!is_url($url)) $url = this.baseUrl +'?'+this.urlGetParameter+$url;
            
            const $http = new XMLHttpRequest();
            try {
                $http.open('GET', $url, false);
                $http.send();
            } catch ($http) {
                return {'error': 'Request "'+$url+'" failed.'};
            };
            return JSON.parse(String($http.responseText));
        };
        
        return request;
    }());

    /**
     * Class nlw data handler.
     * @class nlw.data
     */
    var data = (function() {
        var $http = new request();      
        
        function data() { 
            this.error = null;
            this.data = null;
        };

        /**
         * Converts column character to index.
         * @param {String} $chr
         * @returns {Number}
         */
        var column_chr_to_index = function($chr) {
            return $chr.charCodeAt(0) - 64;
        };
                
        /**
         * Converts a column index to character. 
         * Possible characters are A-Z (uppercase) and a-z (lowercase) if the excel importer is used.
         * Characters like square brackets, backslash, accents 
         * as column name will excluded.
         * @param {Number} $index
         * @returns {String}
         */
        var column_index_to_chr = function($index) {
            var $offset = ( $index > 26 ) ? 6 : 0;
            return String.fromCharCode(64 + parseInt($index+$offset)); 
        };

        /**
         * Check object is set.
         * @param {Object} $object
         * @returns {Boolean}
         */
        var isset = function ($object) {
            return (typeof $object !== 'undefined') ? true : false;
        };
    
        /**
         * Do request.
         * @param {type} $url
         * @returns {Object}
         */
        data.prototype.load = function($url) {
            var $nlwData = $http.load($url);
            if ($nlwData.error !== 'false')
                this.error = 'Error loading data. ('+$nlwData.error+')';
            this.data = $nlwData;
        };

        /**
         * Get cell value.
         * @param {String|Number} $columnId
         * @param {Number} $rowId
         * @returns {String}
         */
        data.prototype.cell = function($columnId, $rowId) {
            var $worksheet = this.data.worksheets.worksheet1;
            var $validColumnId = (typeof $columnId === 'number') ? column_index_to_chr($columnId) : $columnId;
            if (column_chr_to_index($validColumnId) > $worksheet.highestColumnIndex) return;
            if ($rowId > $worksheet.highestRow) return;
            return (isset($worksheet.table[$validColumnId][$rowId])) ? 
                $worksheet.table[$validColumnId][$rowId] : '';
        };
       
        /**
         * Get column.
         * @param {String|Number} $id
         * @returns {Array}
         */
        data.prototype.column = function($id) {
            var $worksheet = this.data.worksheets.worksheet1;
            var $columnId = (typeof $id === 'number') ? column_index_to_chr($id) : $id;
            if (column_chr_to_index($columnId) > $worksheet.highestColumnIndex) return;
            var $column = [];
            for (let $i = 1; $i <= $worksheet.highestRow; $i++) {
                $column.push($worksheet.table[$columnId][$i]);
            };
            return $column;
        };

        /**
         * Get last column.
         * @param {String|Number} $id
         * @returns {Array}
         */        
        data.prototype.column_last = function() {
            var $worksheet = this.data.worksheets.worksheet1;
            var $column = [];
            for (let $i = 1; $i <= $worksheet.highestRow; $i++) {
                $column.push($worksheet.table[column_index_to_chr($worksheet.highestColumnIndex)][$i]);
            };
            return $column;
        };
        
        /**
         * Get row.
         * @param {Number} $id
         * @returns {Array}
         */
        data.prototype.row = function($id) {
            var $worksheet = this.data.worksheets.worksheet1;
            if ($id > $worksheet.highestRow) return;
            var $row = [];
            for (let $i = 1; $i <= $worksheet.highestColumnIndex; $i++) {
                $row.push($worksheet.table[column_index_to_chr($i)][$id]);
            };
            return $row;
        };

        /**
         * Get last row.
         * @param {Number} $id
         * @returns {Array}
         */
        data.prototype.row_last = function() {
            var $worksheet = this.data.worksheets.worksheet1;
            var $row = [];
            for (let $i = 1; $i <= $worksheet.highestColumnIndex; $i++) {
                $row.push($worksheet.table[column_index_to_chr($i)][$worksheet.highestRow]);
            };
            return $row;            
        };

        /**
         * Get complete worksheet.
         * @returns {Object}
         */
        data.prototype.worksheet = function() {
            return this.data;
        };

        /**
         * Get highest column and row index.
         * @returns {Object}
         */
        data.prototype.worksheet_properties = function() {
            var $worksheet = this.data.worksheets.worksheet1;
            return {
                'highestRow': $worksheet.highestRow,
                'highestColumn': $worksheet.highestColumn,
                'highestColumnIndex': $worksheet.highestColumnIndex
            };
        };

        return data;
    }());

    /**
     * @type {nlw.data}
     */
    nlw.data = new data();
})(nlw || (nlw = {}));