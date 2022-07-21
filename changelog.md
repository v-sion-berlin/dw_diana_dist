# Pilot Edge Framework Changelog

<table>
  <tr>
    <th colspan="3">Versions</th>
  </tr>
  <tr>
    <td valign="top">
      <a href="#1.15">1.15</a><br/>
      <a href="#1.14">1.14</a><br/>
      <a href="#1.13">1.13</a><br/>
      <a href="#1.12">1.12</a><br/>
      <a href="#1.11">1.11</a><br/>
      <a href="#1.10">1.10</a><br/>
    </td>
  </tr>
</table>
<!------------------------------------------------------------------------------->
<hr />
<a id="1.15"></a>

## 2022-07-18, Version 1.15

Bugfix release

### Notable changes

- Removed: obsolete help link
- Added: group examples
- Added: dropdown styles
- Added: footer margin
- Removed: full selection on focus

<!------------------------------------------------------------------------------->
<hr />
<a id="1.14"></a>

## 2022-07-13, Version 1.14

Bugfix release

### Notable changes

- Added: additional styles for translation panel alert
- Added: body background-color
- Added: footer styles
- Fixed: rtl for selects and labels
- Fixed: drag-n-drop border color

<!------------------------------------------------------------------------------->
<hr />
<a id="1.13"></a>

## 2022-05-11, Version 1.13

Bugfix release

### Notable changes
* Added: window.initializeDirectionSwitch function for better rtl/ltr handling
* Added: window.initializeTranslationPanel function for better handling of showing/hiding translation panel
* Added: window.capitalize function for making texts capitalized
* Added: INIT & OUT Templates for Corporate Design & Neutrale Inserts
* Added: Vorlage: header.html
* Added: Templates for MADE
* Added: Templates for EMXX
* Added: New Templates for TOPO
* Fixed: Revised TOPO Templates
* Fixed: Removed the helper html tailwindclasses.html, using safelist of tailwind instead
* Fixed: Removed help links from html templates because they will be generated automatically
* Fixed: Moved NLW folder from tool one folder up because nlw changed @dw
* Fixed: Added closing / in all inputs
* Fixed: Branded header is now working with an image that is aligned left
* Removed: Unneeded templates

<!------------------------------------------------------------------------------->
<hr />
<a id="1.12"></a>

## 2022-03-09, Version 1.12

Bugfix release

### Notable changes
* Fixed: Distance of help icon for rtl
* Fixed: Elements with class .dw-direction-ltr under parent with class .dw-direction-rtl automatically getting class text-right
* Added: text-right, text-left, text-center

<!------------------------------------------------------------------------------->
<hr />
<a id="1.11"></a>

## 2022-03-07, Version 1.11

Bugfix release

### Notable changes
* Added: Templates without inputs fields - [Template Framework / Templates ohne Eingabefelder](https://jira.dw.com/browse/DIANA-817)
* Added: CSS Klasse für ltr - [Template Framework / Templates ohne Eingabefelder](https://jira.dw.com/browse/DIANA-1210)
* Added: max='2100-12-31' to date picker in component - [Template Framework / Datepicker Attribute 'max'](https://jira.dw.com/browse/DIANA-1214)
* Fixed: Select fields are only intalic if the first element has the property disabled and this options is selected
* Fixed: Wrong font size for text inputs - [Template Framework / Text-inputs](https://jira.dw.com/browse/DIANA-811)
* Fixed: Wrong font size for Alert/Info - [Template Framework / Alert/Info](https://jira.dw.com/browse/DIANA-816)
* Fixed: Dropdown handle for rtl - [Template Framework / Dropdown rtl](https://jira.dw.com/browse/DIANA-1211)
* Fixed: Table headers for rtl - [Template Framework / Tabelle Labels rtl](https://jira.dw.com/browse/DIANA-1212)
* Fixed: Range slider doesn't set co value - [Template Framework / Control vom Slider nicht ansprechbar](https://jira.dw.com/browse/DIANA-1213)
* Fixed: Cell spacing for tables in rtl - [Template Framework / Platzierung der Spalten bei rtl fehlerhaft](https://jira.dw.com/browse/DIANA-1215)
* Fixed: Missing width classes - [Template Framework / Max-Wert der Input-Feldes "Breite" reagiert nicht](https://jira.dw.com/browse/DIANA-1216)
* Fixed: Wrong slider layout in rtl - [Template Framework / Slider RTL falsche Darstellung](https://jira.dw.com/browse/DIANA-1218)
* Fixed: Bigger font size in rtl via class 'font-large' - [Template Framework / RTL Schriften in Input-Felder schlecht lesbar](https://jira.dw.com/browse/DIANA-1219)
* Removed: dw styled dropdown - class .dw-dropdown-native replaced by .dw-dropdown

<hr />
<a id="1.10"></a>

## 2022-02-14, Version 1.10

Start of the log. Further log entries can contain comments and remarks here.

### Notable changes
* Fixed: data scrubber handling
* Fixed: font size of inputs and dropdowns
* Fixed: font size of buttons, info texts and choice chips
* Fixed: padding of corresponding elements so they need same space as before
* Fixed: image thumbnail shows correct thumbnail after deleting image
* Fixed: removed cursor pointer from input label
* Fixed: min / max check on quantity fields
* Added: changelog
* Added: delete button in image component
* Added: automatic creation of options from nlw data to native dropdown
* Added: drag-and-drop test side
* Added: color indicator
* Added: value field to slider
* Added: help link
* Added: input with icon
* Added: background to images
* Added: comment under image select button
* Cleanup: merged version from dw with version from v-sion

### Corresponding jira tickets
* [Template Framework / Data scrubber - Fehler](https://jira.dw.com/browse/DIANA-801)
* [Template Framework / Text-inputs](https://jira.dw.com/browse/DIANA-811)
* [Template Framework / Feedback-Text unter den inputs](https://jira.dw.com/browse/DIANA-812)
* [Template Framework / Dropdowns](https://jira.dw.com/browse/DIANA-813)
* [Template Framework / Buttons](https://jira.dw.com/browse/DIANA-814)
* [Template Framework / Choice-Chips](https://jira.dw.com/browse/DIANA-815)
* [Template Framework / Alert/Info](https://jira.dw.com/browse/DIANA-816)
* [Template Framework / Labels, die "clickbar" sind](https://jira.dw.com/browse/DIANA-855)
* [Template Framework / Piktogramme im Input](https://jira.dw.com/browse/DIANA-818)
* [Template Framework / Hilfe-Link](https://jira.dw.com/browse/DIANA-819)
* [Template Framework / Farbauswahl mit Name](https://jira.dw.com/browse/DIANA-820)
* [Template Framework / Slider mit Werten](https://jira.dw.com/browse/DIANA-823)
* [Template Framework / Thumbnail-Image (Größe)](https://jira.dw.com/browse/DIANA-868)
* [Template Framework / Kommentar unter Bildauswahl](https://jira.dw.com/browse/DIANA-821)