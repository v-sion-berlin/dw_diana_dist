/**
 * NLW Tool data handler.
 *
 * @version: 1.2.0
 * @author: gunnar.steffen@dw.com
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
             this.baseUrl  = 'http://bwebgs/pilotedge/index.php';
             this.urlGetParameter = new URLSearchParams({
                 'p': 'nlw.api',     // request page
                 'm': 'json',        // output format
                 'f': 'tools/nlw/'   // document root
             });
         }

         /**
          * Check string is url.
          * @param string $str
          * @returns boolean
          */
         var is_url = function($str) {
             let $url;
             try { $url = new URL($str); } catch (_) { return false; };
             return true;
         };

         /**
          * Requester.
          * @param string $url
          * @returns object
          */
         request.prototype.load = function($url) {
             // if a file is passed, built valid request url
             if (!is_url($url)) {
                 $url = this.baseUrl +'?'+this.urlGetParameter.toString()+$url;
             };
             const $http = new XMLHttpRequest();
             $http.open('GET', $url, false);
             $http.send();
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
          * @param string $chr
          * @returns integer
          */
         var column_chr_to_index = function($chr) {
             return $chr.charCodeAt(0) - 64;
         };

         /**
          * Converts a column index to character.
          * Possible characters are A-Z (uppercase) and a-z (lowercase) if the excel importer is used.
          * Characters like square brackets, backslash, accents
          * as column name will excluded.
          * @param integer $index
          * @returns string
          */
         var column_index_to_chr = function($index) {
             var $offset = ( $index > 26 ) ? 6 : 0;
             return String.fromCharCode(64 + parseInt($index+$offset));
         };

         /**
          * Do request.
          * @param string $url
          * @returns object
          */
         data.prototype.load = function($url) {
             var $nlwData = $http.load($url);

             if ($nlwData.error !== 'false')
                 this.error = 'Error loading data. '+$nlwData.error;

             this.data = $nlwData;
         };

         /**
          * Get cell value.
          * @param variant $columnId
          * @param integer $rowId
          * @returns string
          */
         data.prototype.cell = function($columnId, $rowId) {
             var $worksheet = this.data.worksheets.worksheet1;

             var $validColumnId = (typeof $columnId == 'number') ? column_index_to_chr($columnId) : $columnId;
             if (column_chr_to_index($validColumnId) > $worksheet.highestColumnIndex) return;
             if ($rowId > $worksheet.highestRow) return;

             return $worksheet.table[$validColumnId][$rowId];
         };

         /**
          * Get column.
          * @param integer $id
          * @returns array
          */
         data.prototype.column = function($id) {
             var $worksheet = this.data.worksheets.worksheet1;

             var $columnId = (typeof $id == 'number') ? column_index_to_chr($id) : $id;
             if (column_chr_to_index($columnId) > $worksheet.highestColumnIndex) return;

             var $column = [];
             for (let $i = 1; $i <= $worksheet.highestRow; $i++) {
                 $column.push($worksheet.table[$columnId][$i]);
             };
             return $column;
         };

         /**
          * Get last column.
          * @returns array
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
          * @param integer $id
          * @returns array
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
          * @returns array
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
          * @returns object
          */
         data.prototype.worksheet = function() {
             return this.data;
         };

         /**
          * Get highest column and row index.
          * @returns object
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