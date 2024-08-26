var ThingView2D = (function () {
    "use strict";

    //PDF CONSTANTS
    const _markupTypes = {
        note : "note",
        noteLeader : "noteLeader",
        leaderLine : "line",
        leaderLineHeadTail : "lineHeadTail",
        polyline : "multipleLine",
        polyLineHeadTail : "multipleLineHeadTail",
        rectangle : "rectangle",
        rectangleFilled : "rectangleFilled",
        ellipse : "ellipse",
        ellipseFilled : "ellipseFilled",
        polygon : "polygon",
        polygonFilled : "polygonFilled",
        freehand : "freehand",
        textHighlight : "textHighlight",
        textStrikethrough : "textStrikethrough",
        textUnderline : "textUnderline",
        stamp : "stamp"
    };
    Object.freeze(_markupTypes);

    const _cursorTypes = {
        text : "text",
        pan : "pan",
        markup : "markup"
    };
    Object.freeze(_cursorTypes);

    const _uiColors = {
        pdfViewer : {
            background : '#80858E',
            textHighlight: '#0000FF'
        },
        toolbar : {
            text : '#FFFFFF',
            background : '#44474B',
            activeButton : '#232B2D',
            menuButton: '#4D5055',
            activeText: '#000000'
        },
        sidebar : {
            background : '#656872',
            navBorder : '#80858E',
            tab : '#3B4550',
            text : '#FFFFFF'
        },
        markup : {
            line : '#FF0000',
            noteFill : '#F5F4EA',
            selecedLine : "#0000FF",
            highlight: "rgb(255,171,0)",
            underline: "rgb(106,217,38)",
            white: "#FFFFFF",
            transparent: "rgba(255,255,255,0)"
        },
        anchor : {
            fill: 'rgb(255,0,255)',
            box: 'rgb(0,255,0)',
            boxFill: 'rgba(255,255,255,0)'
        }
    };
    Object.freeze(_uiColors);

    const _uiSizes = {
        anchor : {
            width : 20,
            height : 20,
            boxLine : 1,
            boxMargin : 10
        },
        highlight : {
            margin : 5
        }
    };
    Object.freeze(_uiSizes);

    const _noteDefaults = {
        fontColor: "#FF0000",
        fontFamily: "Helvetica,sans-serif",
        fontSize: 12,
        textAlignment: "left",
        minWidth: 10
    };
    Object.freeze(_noteDefaults);

    const _undoPresets = {
        create: "create",
        delete: "delete",
        hide: "hide",
        unhide: "unhide",
        move: "move",
        resize: "resize",
        apply: "apply",
        noteEdit: "edit note"
    };
    Object.freeze(_undoPresets);

    // _svgDefs defines the markers used in creating the heads and tails of various markups
    const _svgDefs = "<defs><marker id='ClosedArrow' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path d='M2,6 L9,1 L9,10 Z' style='fill:" +
                     _uiColors.markup.line +
                     ";' /></marker><marker id='ClosedArrowNote' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path d='M2,6 L9,1 L9,10 Z' style='fill:" +
                     _uiColors.markup.white + ";stroke:" + _uiColors.markup.line +
                     "' /></marker><marker id='OpenArrow' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path d='M9,1 L2,6 L9,10' style='fill:" +
                     _uiColors.markup.transparent + ";stroke:" + _uiColors.markup.line +
                     "' /></marker><marker id='OpenArrowNote' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path d='M9,1 L2,6 L9,10' style='fill:" +
                     _uiColors.markup.transparent + ";stroke:" + _uiColors.markup.line +
                     "' /></marker><marker id='Circle' markerWidth='9' markerHeight='9' refX='5' refY='5' orient='auto'><circle cx='5' cy='5' r='3' style='fill:" +
                     _uiColors.markup.line + ";' /></marker></defs>";

    var _currentCanvasId = "";
    var _parentCanvasId = "";
    //SVG VARS
    var _calloutColors = [];
    var _calloutsSelected = [];
    var _partColors = [];
    var _partsSelected = [];
    var _svgCalloutCB;
    var _zoomWindow = false;
    var _zoomButton = false;
    var _zoomButtonScale;
    //PDF VARS
    var __PDF_DOC = null;
    var __CURRENT_PAGE = 0;
    var __TOTAL_PAGES = 0;
    var __ZOOMSCALE = 1;
    var _pdfCallback = null;
    var _pageMode = "Original";

    var _cursor = {current: "text", cached: null, callback: null};

    var _ignoreScrollEvent = false;
    var _ignoreNavScrollEvent = false;
    var _refreshingPDF = false;
    var _nextRefreshEvent = null;
    var _scrollTimer = null;
    var _marginSize = 10;
    var _zoomInScale = 1.2;
    var _zoomOutScale = 0.8;
    var _largestWidth = 0;
    var _largestHeight = 0;
    var _toolbarEnabled = false;
    var _toolbarHeight = 40;
    var _miniToolbar = false;
    var _toolbarButtonsWidth = 0;
    var _toolbarGroups = {pages: true, zoom: true, cursor: true, search: true, sidebar: true, rotate: true, print: true};
    var _toolbarGroupsLoaded = {targetFull: 13, targetMini: 4, current: 0};
    var _toolbarGroupsValues = {full: [4,2,2,1,1,2,1], mini: [0,2,0,1,0,0,0]};
    var _firstLoadedPage = 0;
    var _lastLoadedPage = 0;
    var _orderToShowPages = [];
    var _bookmarks = [];
    var _documentLoaded = false;
    var _textSelection = null;
    var _sidebarEnabled = false;
    var _navbar = {enabled: true, firstLoadedPage: 0, lastLoadedPage: 0, selectedPage: 0, bufferSize: 5};
    var _navSidebarWidth = 200;
    var _navSidebarWidthLimit = 200;
    var _navWrapperMargin = 10;
    var _navWrapperBorder = 6;
    var _bookmarksBar = {enabled: false};
    var _sidebarResize = false;
    var _searchDrag = {enabled: false, x: 0, y: 0};
    var _pageRotation = 0;
    var _print = null;
    var _printEnabled = true;
    var _prefetchedPage = null;
    var _printCallback = null;
    var _printDocCursor = "";
    var _pdfAnnotationId = -1;
    var _pdfRawAnnotationSet = null;
    var _pdfParsedAnnotationSet = [];
    var _filterPdfMarkups = false;
    var _pageAnnoSetList = {};
    var _scrollOffset = null;

    //PDF Markup Creation
    var _markupMode = {alteredCB: null,
                       on: false,
                       type: null,
                       mouse: {xStart: null,
                               yStart: null,
                               xEnd: null,
                               yEnd: null,
                               xVect: [],
                               yVect: [],
                               pageNo: null,
                               down: false},
                       selectedAnnotations: [],
                       hiddenSelectedAnnotations: []};

    var _markupEdit = {move: false,
                       edit: false,
                       idNo: -1,
                       preventDeselect: false,
                       viewDirty: false,
                       cachedX: -1,
                       cachedY: -1,
                       drag: {x: -1,
                              y: -1,
                              index: -1,
                              target: null,
                              state: false}};

    var _markupHistory = {stack: [],
                          index: -1};

    //PDF Print
    var _pageWrapperTemplate = null;
    var _textLayerTemplate = null;
    var _annotationTemplate = null;
    var _canvasTemplate = null;
    var _navWrapperTemplate = null;
    var _printDivTemplate = null;
    var _printWrapperTemplate = null;
    var _printPageTemplate = null;
    var _printMarkupTemplate = null;

    //PDF Search
    var _pdfSearchCallback = null;
    var _searchResultsCase = false;
    var _searchResultsWord = false;
    var _searchTerm = "";
    var _searchCaseMatch = false;
    var _searchWordMatch = false;
    var _extractTextPromises = [];
    var _pageMatches = [];
    var _matchesCountTotal = 0;
    var _indexedPageNum = 0;
    var _pageContents = [];
    var _scrollMatches = false;
    var _findTimeout = null;
    var _searchState = null;
    var _dirtyMatch = false;
    var _selected = {
        pageIdx: -1,
        matchIdx: -1
    };
    var _offset = {
        pageIdx: null,
        matchIdx: null,
        wrapped: false
    };
    var _resumePageIdx = null;
    var _pendingFindMatches = Object.create(null);
    var _matchSelected = {
        pageIdx:  -1,
        matchIdx: -1
    };
    var _pagesToSearch = null;
    var _charactersToNormalize = {
        "\u2018": '\'',
        "\u2019": '\'',
        "\u201A": '\'',
        "\u201B": '\'',
        "\u201C": '"',
        "\u201D": '"',
        "\u201E": '"',
        "\u201F": '"',
        "\xBC": '1/4',
        "\xBD": '1/2',
        "\xBE": '3/4'
    };
    var _normalizationRegex = null;
    var _searchStatusMessage = {
        searching: "Searching for results...",
        enterTerm: "Enter a search term",
        notFound: "Search term not found"
    };

    //PDF MARKUP OBSERVER
    var _markupObserver = null;

    function MarkupObserver() {
        var callbacks = {};

        return {
            set: function(key){
                if (callbacks[key]) {
                    callbacks[key].forEach(function(callback){
                        callback();
                    });
                }
            },

            set: function(key, value){
                if (callbacks[key]) {
                    callbacks[key].forEach(function(callback){
                        callback(value);
                    });
                }
            },

            set: function(key, value, op){
                if (callbacks[key]) {
                    callbacks[key].forEach(function(callback){
                        callback(value, op);
                    });
                }
            },

            addCallback: function(key, callbackToAdd){
                if (!callbacks[key]) {
                    callbacks[key] = [];
                }
                callbacks[key].push(callbackToAdd);
            },

            removeCallback: function(key, callbackToRemove){
                if (callbacks[key]) {
                    callbacks[key] = callbacks[key].filter(function (callback) {
                        return callback !== callbackToRemove;
                    });
                }
            }
        };
    }

    function normalize(text) {
        if (!_normalizationRegex) {
            var replace = Object.keys(_charactersToNormalize).join('');
            _normalizationRegex = new RegExp("[".concat(replace, "]"), 'g');
        }

        return text.replace(_normalizationRegex, function (ch) {
            return _charactersToNormalize[ch];
        });
    }

    //Public Functions
    var returnObj = {
        //SHARED
        LoadDocument: function (viewable, parentCanvasId, model, isWindowless, callback){
          _LoadDocument(viewable, parentCanvasId, model, isWindowless, callback);
        },
        LoadPDF: function (parentCanvasId, val, isUrl, isWindowless, callback){
           _LoadPdfDocument(parentCanvasId, val, isUrl, isWindowless, callback);
        },
        Destroy2DCanvas: function() {
            _destroy2DCanvas();
        },
        ResetTransform: function(elem){
          _resetTransform(elem);
        },
        SetZoomOnButton: function(scale){
            if (_zoomWindow) {
                _setZoomWindow();
            }
            _setZoomOnButton(scale);
        },
        //SVG
        IsSVGSession: function() {
            return _IsSVGSession();
        },
        ResetTransformSVG: function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _resetTransform(document.getElementById(_currentCanvasId).childNodes[0]);
        },
        SetZoomWindow: function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _setZoomWindow();
        },
        GetCallouts: function(){
            return _getCallouts();
        },
        SelectCallout: function (callout) {
            if (_calloutsSelected.indexOf(callout.id) == -1) {
                _selectCallout(callout);
            }
        },
        DeselectCallout: function(callout){
            if(_calloutsSelected.indexOf(callout.id) != -1){
                _deselectCallout(callout);
                var index = _calloutsSelected.indexOf(callout.id);
                if (index !=-1){
                    _calloutsSelected.splice(index,1);
                }
            }
        },
        GetSVGParts: function(partNo){
            return _getSVGParts(partNo);
        },
        SetSVGCalloutCallback: function(callback){
            if(typeof callback === "function"){
                _svgCalloutCB = callback;
            }
        },
        //PDF
        CreatePDFSession: function(parentCanvasId, callback) {
            _createPDFSession(parentCanvasId, callback);
        },
        SetPDFCallback: function (callback) {
            if (typeof callback === "function"){
                _pdfCallback = callback;
            }
        },
        IsPDFSession: function() {
            return _IsPDFSession();
        },
        LoadPrevPage: function (callback) {
            _LoadPrevPage(callback);
        },
        LoadNextPage: function (callback) {
            _LoadNextPage(callback);
        },
        LoadPage: function (callback, pageNo) {
            _LoadPage(callback, parseInt(pageNo));
        },
        GetCurrentPDFPage: function () {
            if (_IsPDFSession()){
                return __CURRENT_PAGE;
            }
        },
        GetTotalPDFPages: function () {
            if (_IsPDFSession()){
                return __TOTAL_PAGES;
            }
        },
        GetPdfBookmarks: function() {
            if(_IsPDFSession()){
                return _bookmarks;
            }
        },
        SetDocumentLoaded: function() {
            if(_IsPDFSession()){
                _documentLoaded = true;
            }
        },
        GetDocumentLoaded: function() {
            if(_IsPDFSession()){
                return _documentLoaded;
            }
        },
        ResetTransformPDF: function(){
            if(_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _resetTransformPDF();
        },
        SetPageModePDF: function(pageMode){
            if(_IsPDFSession()){
                _pageMode = pageMode;
                _setPageModePDF();
            }
        },
        SetPageModePDFWithCB: function(pageMode, callback){
            if(_IsPDFSession()){
                _pageMode = pageMode;
                _setPageModePDF(callback);
            }
        },
        SetPanModePDF: function(){
            if(_IsPDFSession()){
                if (_zoomButton) {
                    _setZoomOnButton(_zoomButtonScale);
                }
                if (_cursor.current == _cursorTypes.markup) {
                    _togglePdfMarkupMode(null, false, []);
                }
                _cursor.current = _cursorTypes.pan;
                _setUserSelect();
                if (_cursor.callback) {
                    _cursor.callback(_cursorTypes.pan);
                }
            }
        },
        SetTextModePDF: function(){
            if(_IsPDFSession()){
                if (_zoomButton) {
                    _setZoomOnButton(_zoomButtonScale);
                }
                if (_cursor.current == _cursorTypes.markup) {
                    _togglePdfMarkupMode(null, false, []);
                }
                _cursor.current = _cursorTypes.text;
                _setUserSelect();
                if (_cursor.callback) {
                    _cursor.callback(_cursorTypes.text);
                }
            }
        },
        /**
        * Change the cursor mode to or from "Markup" and enter / exit markup creation mode
        * @method SetMarkupModePDF
        * @param {string} markupType the type of markup to create (null if switching off)
        *  markupType can be:
        *   "note" - plain note
        *   "noteLeader" - note with leader line
        *   "line" - plain single leader line
        *   "lineHeadTail" - single leader line with a head and tail
        *   "multipleLine" - plain leader line with multiple branches
        *   "multipleLineHeadTail" - leader line with multiple branches, head and tail
        *   "rectangle" - hollow (not filled) rectangle
        *   "rectangleFilled" - filled rectangle
        *   "ellipse" - hollow ellipse
        *   "ellipseFilled" - filled ellipse
        *   "polygon" - hollow polygon
        *   "polygonFilled" - filled polygon
        *   "freehand" - freehand
        *   "textHighlight" - text highlight
        *   "textStrikethrough" - text strikethrough
        *   "textUnderline" - text underline
        *   "stamp" - stamp
        * @param {bool} markupOn Turn the mode on or off
        * @param {array} options reserved for Stamps for now
        * @public
        * @memberof ThingView
        **/
        SetMarkupModePDF : function (markupType, markupOn, options) {
            if (_IsPDFSession()) {
                if (_checkPageRotation() != 0 && markupOn) {
                    _markupObserver.set("annoModeComplete", markupType);
                    if (_cursor.current == _cursorTypes.pan) {
                        this.SetPanModePDF();
                    } else if (_cursor.current == _cursorTypes.text) {
                        this.SetTextModePDF();
                    }
                    return;
                }
                if (_zoomButton) {
                    _setZoomOnButton(_zoomButtonScale);
                }
                if (markupOn) {
                    if (!_cursor.cached) {
                        _cursor.cached = _cursor.current;
                    }
                    _cursor.current = _cursorTypes.markup;
                    if (_cursor.cached == _cursorTypes.text &&
                        !(markupType == _markupTypes.textHighlight ||
                          markupType == _markupTypes.textStrikethrough ||
                          markupType == _markupTypes.textUnderline)) {
                        _setUserSelect();
                    }
                    _togglePdfMarkupMode(markupType, markupOn, options);
                } else {
                    if (_markupMode.type == _markupTypes.note || _markupMode.type == _markupTypes.noteLeader) {
                        _createNoteMarkup();
                    }
                    if (_cursor.cached == _cursorTypes.pan) {
                        this.SetPanModePDF();
                    } else if (_cursor.cached == _cursorTypes.text) {
                        this.SetTextModePDF();
                    }
                    _cursor.cached = null;
                }
            }
        },
        /**
        * Set the function to call (back to the external application) when the cursor mode changes
        * Should be called when a pdf is first loaded
        * Callback will be called with the type of cursor mode as
        * a parameter (string: "text", "pan", or "markup")
        * @param {SetPdfCursorCallback} callback The function to call when cursor mode is changed
        * @public
        * @memberof ThingView
        **/
        SetPdfCursorCallback: function (callback) {
            if (_IsPDFSession()) {
                _cursor.callback = callback;
            }
        },
        SetPdfToolbar: function(parentId, enabled, groups) {
            if(_IsPDFSession()){
                var parent = document.getElementById(parentId);
                _toolbarEnabled = enabled;
                if (groups) {
                    _toolbarGroups = groups;
                    _toolbarGroupsLoaded.targetFull = 0;
                    _toolbarGroupsLoaded.targetMini = 1;
                    var values = Object.values(groups);
                    for (var i = 0; i < values.length; i++) {
                        if (values[i]) {
                            _toolbarGroupsLoaded.targetFull += _toolbarGroupsValues.full[i];
                            _toolbarGroupsLoaded.targetMini += _toolbarGroupsValues.mini[i];
                        }
                    }
                }
                if (enabled) {
                    _DisplayDocumentToolbar(parent, _toolbarGroups);
                    _resizeDocumentToolbar(parent, _toolbarGroups);
                } else {
                    _RemoveDocumentToolbar(parent);
                }
            }
        },
        SetPdfToolbarGroups: function (groups) {
            _toolbarGroups = groups;
            if (groups) {
                _toolbarGroups = groups;
                _toolbarGroupsLoaded.targetFull = 0;
                _toolbarGroupsLoaded.targetMini = 1;
                var values = Object.values(groups);
                for (var i = 0; i < values.length; i++) {
                    if (values[i]) {
                        _toolbarGroupsLoaded.targetFull += _toolbarGroupsValues.full[i];
                        _toolbarGroupsLoaded.targetMini += _toolbarGroupsValues.mini[i];
                    }
                }
            }
        },
        ShowPdfBookmark: function(bookmarkTitle) {
            if(_IsPDFSession()){
                _ShowPdfBookmark(bookmarkTitle);
            }
        },
        SearchInPdfDocument: function(searchTerm, callback, findDirection){
            if(_IsPDFSession() && searchTerm != ""){
                _SearchInPdfDocument(searchTerm, findDirection, callback);
            }
        },
        ClearPdfDocumentSearch: function () {
            if(_IsPDFSession()){
                _searchTerm = "";
                _removePdfSearchResultHighlights ();
            }
        },
        FocusNextPdfDocumentSearch: function () {
            if(_IsPDFSession() && _searchState) {
                _searchState.highlightAll = false;
                _searchState.findPrevious = false;
                _nextMatch();
            }
        },
        FocusPrevPdfDocumentSearch: function () {
            if(_IsPDFSession() && _searchState) {
                _searchState.highlightAll = false;
                _searchState.findPrevious = true;
                _nextMatch();
            }
        },
        FocusAllPdfDocumentSearch: function() {
            if(_IsPDFSession() && _searchState) {
                _searchState.highlightAll = true;
                _searchState.findPrevious = false;
                setTimeout(_checkLoadedPagesSearched, 100);
            }
        },
        SetPdfSearchCaseMatch: function (matchCase) {
            if(_IsPDFSession()){
                _searchCaseMatch = matchCase;
            }
        },
        SetPdfSearchWordMatch: function (matchWord) {
            if(_IsPDFSession()){
                _searchWordMatch = matchWord;
            }
        },
        TogglePdfSidePane: function () {
            if (_IsPDFSession()) {
                _togglePdfSidePane();
            }
        },
        RotateDocumentPages: function (clockwise) {
            if (_IsPDFSession()) {
                _RotateDocumentPages(clockwise);
            }
        },
        PrintPdf: function () {
            if (_IsPDFSession() && _printEnabled) {
                _PrintPdf(document.getElementById(_currentCanvasId).parentNode.parentNode);
            }
        },
        LoadPdfAnnotationSet: function(documentViewable, parentCanvasId, docScene, structure, annoSet, isWindowless, documentCallback) {
            _LoadPdfAnnotationSet(documentViewable, parentCanvasId, docScene, structure, annoSet, isWindowless, documentCallback);
        },
        ApplyPdfAnnotationSet: function(annoSet, documentCallback) {
            _ApplyPdfAnnotationSet(annoSet, documentCallback);
        },
        GetLoadedPdfAnnotationSetFdf: function(docScene, author, filePath, callback) {
            _GetLoadedPdfAnnotationSetFdf(docScene, author, filePath, callback);
        },
        ZoomOnButtonPdf: function(scale) {
            _zoomButtonScale = scale;
            _zoomButtonPDF();
        },
        ZoomAllButtonPdf: function(){
            if(_IsPDFSession()){
                _pageMode = "FitZoomAll";
                _setPageModePDF();
            }
        },
        GetPdfPrintBuffers: function(firstPage, lastPage, width, height, callback) {
            if(_IsPDFSession() && _printEnabled) {
                _GetPdfPrintBuffers(document.getElementById(_currentCanvasId).parentNode.parentNode, firstPage, lastPage, width, height, callback);
            }
        },
        GetSinglePdfPrintBuffer : function(pageNo, width, height, callback) {
            if(_IsPDFSession() && _printEnabled) {
                _GetPdfPrintBuffers(document.getElementById(_currentCanvasId).parentNode.parentNode, pageNo, pageNo, width, height, callback);
            }
        },
        SetPdfMarkupsFilter : function(filterOn) {
            if(_IsPDFSession()) {
                _setPdfMarkupsFilter(filterOn);
            }
        },
        GetPdfMarkupsFilter : function() {
            if (_IsPDFSession()) {
                return _filterPdfMarkups;
            }
        },
        SetMarkupAlteredCallback : function (callback) {
            if (callback) {
                _markupMode.alteredCB = callback;
            }
        },
        SelectPdfMarkup : function (idNo, selected) {
            if (_IsPDFSession()) {
                    _handleSelectPdfAnnoAPI(idNo, selected);
            }
        },
        ClearPdfMarkupSelection : function () {
            if (_IsPDFSession()) {
                _clearPdfAnnoSelection();
            }
        },
        DeletePdfMarkup : function (idNo) {
            if (_IsPDFSession()) {
                _handleDeletePdfAnnoAPI(idNo);
            }
        },
        SetPdfMarkupVisibility : function (idNo, visible) {
            if (_IsPDFSession()) {
                _handleSetPdfMarkupVisibility(idNo, visible);
            }
        },
        UndoPdfMarkupAction : function () {
            if (_IsPDFSession()) {
                _undoPdfMarkupAction();
            }
        },
        RedoPdfMarkupAction : function () {
            if (_IsPDFSession()) {
                _redoPdfMarkupAction();
            }
        },
        //PDF MARKUP OBSERVER CALLBACKS
        SetAnnotationSetLoadedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoSetLoaded", callback);
            }
        },
        SetAnnotationSelectedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoSelected", callback);
            }
        },
        SetAnnotationDeletedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoDeleted", callback);
            }
        },
        SetAnnotationCreatedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoCreated", callback);
            }
        },
        SetAnnotationVisibilityCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoVisChanged", callback);
            }
        },
        SetAnnotationSetEditedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoSetEdited", callback);
            }
        },
        SetAnnotationModeCompleteCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoModeComplete", callback);
            }
        },
        SetAnnotationUndoActionAddedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoUndoActionAdded", callback);
            }
        }
    };

    extendObject(ThingView, returnObj);

    //Private Functions

    //SHARED
    function extendObject (obj1, obj2) {
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
        return obj1;
    }

    function _stringToFloatArray(string) {
        var stringArray = string.split(", ");
        var floatArray = [];
        for (var i = 0; i < stringArray.length; i++){
            floatArray.push(parseFloat(stringArray[i]));
        }
        return floatArray;
    }

    function _LoadDocument(viewable, parentCanvasId, model, isWindowless, callback){
        _markupObserver = null;
        if(viewable && model){
            if(viewable.type==Module.ViewableType.DOCUMENT && viewable.fileSource.indexOf(".pdf", viewable.fileSource.length - 4) != -1){
                if (!_IsPDFSession()){
                    _createPDFSession(parentCanvasId, function(){
                        _cursor.current = _cursorTypes.text;
                        _pageMode = "Original";
                        _bookmarks = [];
                        _documentLoaded = false;
                        _markupObserver = MarkupObserver();
                        _markupMode.selectedAnnotations = [];
                        _markupMode.hiddenSelectedAnnotations = [];
                        _pdfParsedAnnotationSet = [];
                        model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                            _LoadPDF(val, false, callback, isWindowless);
                        });
                    });
                } else {
                    _cursor.current = _cursorTypes.text;
                    _pageMode = "Original";
                    _bookmarks = [];
                    _documentLoaded = false;
                    _markupObserver = MarkupObserver();
                    _markupMode.selectedAnnotations = [];
                    _markupMode.hiddenSelectedAnnotations = [];
                    _pdfParsedAnnotationSet = [];
                    model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                        _LoadPDF(val, false, callback);
                    });
                }
            }
            else if (viewable.type==Module.ViewableType.ILLUSTRATION && viewable.fileSource.indexOf(".svg", viewable.fileSource.length - 4) != -1){
                if(!_IsSVGSession()){
                    _createSVGSession(parentCanvasId);
                }
                model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                    _LoadSVG(decodeURIComponent(escape(val)), callback);
                });
            } else callback(false);
        } else {
            callback(false);
        }
    }

    function _LoadPdfDocument (parentCanvasId, pdfVal, isUrl, isWindowless, callback){
        _markupObserver = null;
        if (parentCanvasId && pdfVal) {
            if (!_IsPDFSession()){
                _createPDFSession(parentCanvasId, function(){
                    _documentLoaded = false;
                    _markupObserver = MarkupObserver();
                    _cursor.current = _cursorTypes.text;
                    _pageMode = "FitWidth";
                    _bookmarks = [];
                    _pdfAnnotationId = -1;
                    _pdfParsedAnnotationSet = [];
                    _markupMode.selectedAnnotations = [];
                    _markupMode.hiddenSelectedAnnotations = [];
                    _LoadPDF(pdfVal, isUrl, callback, isWindowless);
                });
            } else {
                _documentLoaded = false;
                _markupObserver = MarkupObserver();
                _cursor.current = _cursorTypes.text;
                _pageMode = "FitWidth";
                _bookmarks = [];
                _pdfAnnotationId = -1;
                _pdfParsedAnnotationSet = [];
                _markupMode.selectedAnnotations = [];
                _markupMode.hiddenSelectedAnnotations = [];
                _LoadPDF(pdfVal, isUrl, callback, isWindowless);
            }
        }
    }

    function _resetTransform(elem){
        _setTransformMatrix(elem, 1, 0, 0, 1, 0, 0);
    }

    function _destroy2DCanvas(){
        _removeWindowEventListenersSVG();
        _removeWindowEventListenersPDF();
        var currentCanvas =  document.getElementById(_currentCanvasId);
        var parent = currentCanvas.parentNode;
        parent.style.cursor = "";
        parent.removeChild(currentCanvas);
        if(_IsPDFSession()){
            _RemoveDocumentToolbar(parent.parentNode);
            _RemovePdfSideBar (parent.parentNode);
            parent.parentNode.removeChild(document.getElementById("CreoDocumentScrollWrapper"));
        }
        _currentCanvasId = "";
    }

    //SVG
    function _createSVGSession(parentCanvasId){
        if(_IsPDFSession()){
            _destroy2DCanvas();
        }
        else if (!_IsSVGSession()){
            ThingView.Hide3DCanvas();
        }
        _currentCanvasId = "";
        var svgWrapper = document.createElement("div");
        var parent = document.getElementById(parentCanvasId);
        svgWrapper.id = parentCanvasId + "_CreoViewSVGDiv" + ThingView.GetNextCanvasID();
        var width = parent.clientWidth;
        var height = parent.clientHeight;
        svgWrapper.setAttribute('style',"position: relative; height: 100%; width: 100%; overflow: hidden");
        parent.style.overflow = "hidden";
        var svgHolder = document.createElement("div");
        svgHolder.setAttribute("type", "image/svg+xml");

        var deselect = {
            x:0,
            y:0
        };
        var drag = {
            x: 0,
            y: 0,
            state: false,
        };
        var rightClickDrag = {
            x: 0,
            y: 0,
            lastY: 0,
            state: false
        };
        var zoomDrag = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            state: false
        };
        var zoomPinch = {
            xCenter: 0,
            yCenter: 0,
            oldXs : {},
            oldYs : {},
            newXs : {},
            newYs : {},
            state: false
        };
        var twoPointDrag = {
            x: 0,
            y: 0,
            state: false,
        };

        var rectCanvas = document.createElement("canvas");
        rectCanvas.setAttribute('style',"position: absolute; top: 0%; left: 0%");
        rectCanvas.setAttribute('width',width);
        rectCanvas.setAttribute('height',height);

        svgWrapper.addEventListener("wheel", _zoomOnWheelSVG);
        svgWrapper.addEventListener("dblclick", function(){
            if(!_zoomButton){
                _resetTransform(svgHolder);
            }
        },{passive: false});

        svgWrapper.addEventListener("mousedown", function(e){
            e.preventDefault();
            if (_zoomWindow) {
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            } else if (_zoomButton) {
                _zoomOnButton(e);
            } else if (!drag.state && e.button==0) {
                _handlePanEvent(e, drag);
            } else if (!rightClickDrag.state && e.button==2) {
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper);
            }
            deselect.x = e.pageX;
            deselect.y = e.pageY;
        },{passive: false});

        svgWrapper.addEventListener("mouseup", function(e){
            e.preventDefault();
            if(_zoomWindow && zoomDrag.state){
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            } else if(drag.state){
                _handlePanEvent(e, drag);
            } else if(rightClickDrag.state){
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper);
            }
            var target = String(e.target.className.baseVal);
            target = target != "" ? target : String(e.target.parentNode.className.baseVal);
            if (e.pageX == deselect.x && e.pageY == deselect.y &&
                !(e.ctrlKey || e.metaKey) &&
                !(target.indexOf("hotspot") != -1) &&
                !(target.indexOf("callout") != -1)) {
                _deselectAllCallouts();
            }
        }, {passive: false});

        svgWrapper.addEventListener("mousemove", function(e){
            e.preventDefault();
            if (!_zoomWindow) {
                if(drag.state){
                    _handlePanEvent(e, drag);
                } else if(rightClickDrag.state){
                    _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper);
                }
            } else if (_zoomWindow && zoomDrag.state) {
               _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            }
        }, {passive: false});

        svgWrapper.addEventListener("mouseleave", function(){
            if (_zoomWindow && zoomDrag.state){
                window.addEventListener("mouseup", function(e){
                    if(_zoomWindow && zoomDrag.state){
                        _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                    }
                });
                window.addEventListener("mousemove", function(e){
                    if (_zoomWindow && zoomDrag.state) {
                        _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                    }
                });
            } else if(drag.state){
                window.addEventListener("mouseup", function(e){
                    if(drag.state){
                        _handlePanEvent(e, drag);
                    }
                });
                window.addEventListener("mousemove", function(e){
                    e.stopPropagation();
                    if(drag.state){
                        _handlePanEvent(e, drag);
                    }
                });
            } else if (rightClickDrag.state){
                window.addEventListener("mouseup", function(e){
                    if(rightClickDrag.state){
                        _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper);
                    }
                });
                window.addEventListener("mousemove", function(e){
                    e.stopPropagation();
                    if(rightClickDrag.state){
                        _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper);
                    }
                });
            }
        },{passive: false});
        svgWrapper.addEventListener("mouseenter", function(){
            _removeWindowEventListenersSVG(drag, rightClickDrag, svgWrapper, zoomDrag);
        },{passive: false});

        var touchMoved = false;
        svgWrapper.addEventListener("touchstart", function(e){
            touchMoved = false;
            if (e.touches.length <= 1) {
                if (_zoomWindow) {
                    _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                } else if (_zoomButton) {
                    _zoomOnButton(e);
                } else {
                    _handlePanEvent(e, drag);
                }
            } else {
                _handleZoomOnPinchEvent(e, zoomPinch);
                _handleTwoPointPanEvent(e, twoPointDrag);
            }
        },{passive: false});

        var lastTap = 0;
        svgWrapper.addEventListener("touchend", function(e){
            e.preventDefault();
            if (!zoomPinch.state) {
                var currTime = new Date().getTime();
                var tapLength = currTime - lastTap;
                if (tapLength < 200 && tapLength > 0){
                    if(!_zoomButton){
                        _resetTransform(svgHolder);
                        drag.state = false;
                    }
                } else if(_zoomWindow && zoomDrag.state){
                    _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                } else if(drag.state){
                    _handlePanEvent(e, drag);
                } else if(twoPointDrag.state) {
                    _handleTwoPointPanEvent(e, twoPointDrag);
                }
                lastTap = currTime;
                e.stopPropagation();
                if(!touchMoved && !(e.ctrlKey || e.metaKey)){
                    _deselectAllCallouts();
                }
            } else {
                _handleZoomOnPinchEvent(e, zoomPinch);
                if(drag.state){
                    _handlePanEvent(e, drag);
                }
            }
            touchMoved = false;
        }, {passive: false});

        svgWrapper.addEventListener("touchmove", function(e){
            e.preventDefault();
            if (!zoomPinch.state) {
                if (!_zoomWindow) {
                    if (drag.state){
                        _handlePanEvent(e, drag);
                    }
                } else if (_zoomWindow && zoomDrag.state) {
                   _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                }
            } else  if (zoomPinch.state && e.touches.length == 2){
                _handleZoomOnPinchEvent(e, zoomPinch);
            }
            if (twoPointDrag.state) {
                _handleTwoPointPanEvent(e, twoPointDrag);
            }
            touchMoved = true;
        }, {passive: false});

        svgWrapper.insertBefore(svgHolder, svgWrapper.childNodes[0]);
        svgHolder.setAttribute('style',"position: relative; height: inherit; width: inherit");
        parent.insertBefore(svgWrapper, parent.childNodes[0]);
        _currentCanvasId = svgWrapper.id;
        return;
    }

    function _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper){
        if (e.type == "mousedown" || e.type == "touchstart") {
            zoomDrag.x1 = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
            zoomDrag.y1 = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
            zoomDrag.state = true;
            rectCanvas.getContext('2d').clearRect(0,0,parseInt(rectCanvas.width),parseInt(rectCanvas.height));
            svgWrapper.insertBefore(rectCanvas, svgWrapper.childNodes[1]);
        } else if (e.type == "mouseup" || e.type == "touchend") {
            _zoomOnWindowSVG(e, zoomDrag);
            svgWrapper.removeChild(rectCanvas);
            zoomDrag.state = false;
            _setZoomWindow();
        } else if (e.type == "mousemove" || e.type == "touchmove") {
            _drawZoomWindow(rectCanvas, zoomDrag, e);
            zoomDrag.x2 = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
            zoomDrag.y2 = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
        }
    }

    function _handlePanEvent(e, drag){
        if (e.type == "mousedown" || e.type == "touchstart") {
            drag.x = e.type.indexOf("touch") != -1 ? Math.floor(e.touches[0].pageX) : e.pageX;
            drag.y = e.type.indexOf("touch") != -1 ? Math.floor(e.touches[0].pageY) : e.pageY;
            drag.state = true;
        } else if (e.type == "mouseup" || e.type == "touchend") {
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            drag.state = false;
        } else if (e.type == "mousemove" || e.type == "touchmove") {
            document.getElementById(_currentCanvasId).style.cursor = "url(" + ThingView.resourcePath + "/cursors/pan.cur),auto";
            _panSVG(e, drag);
        }
    }

    function _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper){
        if (e.type == "mousedown") {
            rightClickDrag.x = e.pageX;
            rightClickDrag.y = e.pageY;
            rightClickDrag.lastY = e.pageY;
            rightClickDrag.state = true;
            svgWrapper.oncontextmenu = function(){return true;};
        } else if (e.type == "mouseup") {
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            rightClickDrag.state = false;
        } else if (e.type == "mousemove") {
            svgWrapper.oncontextmenu = function(){return false;};
            document.getElementById(_currentCanvasId).style.cursor = "url(" + ThingView.resourcePath + "/cursors/zoom.cur),auto";
            _zoomOnRightClickSVG(e, rightClickDrag);
        }
    }

    function _handleZoomOnPinchEvent(e, zoomPinch){
        if (e.type == "touchstart") {
            var touchCenter = _getTouchCenter(e);
            zoomPinch.xCenter = touchCenter.x;
            zoomPinch.yCenter = touchCenter.y;
            zoomPinch.oldXs = {x0: e.touches[0].pageX, x1: e.touches[1].pageX};
            zoomPinch.oldYs = {y0: e.touches[0].pageY, y1: e.touches[1].pageY};
            zoomPinch.state = true;
        } else if (e.type == "touchend") {
            zoomPinch.state = false;
        } else if (e.type == "touchmove") {
            zoomPinch.newXs = {x0: e.touches[0].pageX, x1: e.touches[1].pageX};
            zoomPinch.newYs = {y0: e.touches[0].pageY, y1: e.touches[1].pageY};
            _zoomOnPinch(e, zoomPinch);
        }
    }

    function _handleTwoPointPanEvent(e, twoPointDrag){
        if (e.type == "touchstart") {
            var touchCenter = _getTouchCenter(e);
            twoPointDrag.x = touchCenter.x;
            twoPointDrag.y = touchCenter.y;
            twoPointDrag.state = true;
        } else if (e.type == "touchend") {
            twoPointDrag.state = false;
        } else if (e.type == "touchmove") {
            _panSVG(e, twoPointDrag);
        }
    }

    function _removeWindowEventListenersSVG(drag, rightClickDrag, svgWrapper, zoomDrag) {
        window.removeEventListener("mouseup", function(e){
            if(_zoomWindow && zoomDrag.state){
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            }
        });
        window.removeEventListener("mousemove", function(e){
            if (_zoomWindow && zoomDrag.state) {
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            }
        });
        window.removeEventListener("mouseup",function(){
            if(drag.state){
                _handlePanEvent(e, drag);
            }
        });
        window.removeEventListener("mousemove", function(e){
            e.stopPropagation();
            if(drag.state){
                _handlePanEvent(e, drag);
            }
        });
        window.removeEventListener("mouseup", function(){
            if(rightClickDrag.state){
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper);
            }
        });
        window.removeEventListener("mousemove", function(e){
            e.stopPropagation();
            if(rightClickDrag.state){
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper);
            }
        });
    }

    function _getTransformMatrix(svgHolder){
        var svgTransform = getComputedStyle(svgHolder).getPropertyValue('transform');
        if(svgTransform=="none"){
            svgTransform = "matrix(1, 0, 0, 1, 0, 0)";
        }
        var matrix = svgTransform.replace(/[^\d.,-]/g, '').split(',').map(Number);
        return matrix;
    }

    function _setTransformMatrix(elem, scaleX, skewX, skewY, scaleY, transX, transY){
        var newTransform = "transform: matrix(" + scaleX + "," + skewX + "," + skewY + "," + scaleY + "," + transX + "," + transY + ")";
        var currentStyle = elem.style.cssText;
        var newStyle = "";
        if(currentStyle.indexOf("transform") != -1) {
            var i = currentStyle.indexOf("transform");
            var j = currentStyle.indexOf(";", i)+1;
            newStyle = currentStyle.substr(0, i) + currentStyle.substr(j);
        } else {
            newStyle = currentStyle;
        }
        newStyle = newStyle + newTransform;
        elem.setAttribute('style',newStyle);
    }

    function _getTouchCenter (e){
        var sumX = 0;
        var sumY = 0;
        for (var i=0; i < e.touches.length; i++){
            sumX += e.touches[i].pageX;
            sumY += e.touches[i].pageY;
        }
        return {x: Math.floor(sumX / i), y: Math.floor(sumY / i)};
    }

    function _panSVG(e, drag){
        e.preventDefault();
        var pageX = e.type.indexOf("touch") == -1 ? e.pageX : _getTouchCenter(e).x;
        var pageY = e.type.indexOf("touch") == -1 ? e.pageY : _getTouchCenter(e).y;
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var deltaX = pageX - drag.x;
        var deltaY = pageY - drag.y;
        var matrix = _getTransformMatrix(svgHolder);
        _setTransformMatrix(svgHolder, matrix[0], matrix[1], matrix[2], matrix[3], (matrix[4] + deltaX), (matrix[5] + deltaY));
        drag.x = pageX;
        drag.y = pageY;
    }

    function _getElementCenter(elem) {
        var boundingRect = elem.getBoundingClientRect();
        var centerX = (boundingRect.left + boundingRect.right)/2;
        var centerY = (boundingRect.top + boundingRect.bottom)/2;
        return {x: centerX, y: centerY};
    }

    function _zoomOnWheelSVG(e){
        var ZOOMMODIFIER = 0.15;
        var MAXZOOM = 10.0;
        var MINZOOM = 0.15;

        var svgHolder = e.currentTarget.childNodes[0];
        var center = _getElementCenter(svgHolder);
        var mouseDeltaX = (center.x - e.pageX) * ZOOMMODIFIER;
        var mouseDeltaY = (center.y - e.pageY) * ZOOMMODIFIER;

        var matrix = _getTransformMatrix(svgHolder);

        var delta = e.deltaY > 0 ? 1 : -1;

        var newScale = matrix[0] * (1 + (delta * ZOOMMODIFIER));
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (mouseDeltaX * delta)), (matrix[5] + (mouseDeltaY * delta)));
        }
    }

    function _setZoomOnButton(scale){
        if(!_zoomButtonScale || !(_zoomButton && _zoomButtonScale != scale)) {
            _zoomButton = !_zoomButton;
        }
        if(_zoomButton) {
            _zoomButtonScale = scale;
            document.getElementById(_currentCanvasId).style.cursor = "url(" + ThingView.resourcePath + "/cursors/zoom.cur),auto";
            document.addEventListener('keydown', function(e){
                if (e.key == "Escape" && _zoomButton) {
                    _setZoomOnButton(scale);
                }
            });
        } else {
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            document.removeEventListener('keydown', function(e){
                if (e.key == "Escape" && _zoomButton) {
                    _setZoomOnButton(scale);
                }
            });
        }
    }

    function _zoomOnButton(e) {
        var MAXZOOM = 10.0;
        var MINZOOM = 0.15;

        var svgHolder = e.currentTarget.childNodes[0];
        var center = _getElementCenter(svgHolder);

        var pageX = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
        var pageY = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;

        var mouseDeltaX = _zoomButtonScale < 1 ? (center.x - pageX) * (1 - _zoomButtonScale) : (center.x - pageX) * (_zoomButtonScale - 1);
        var mouseDeltaY = _zoomButtonScale < 1 ? (center.y - pageY) * (1 - _zoomButtonScale) : (center.y - pageY) * (_zoomButtonScale - 1);

        var matrix = _getTransformMatrix(svgHolder);

        var delta = _zoomButtonScale >= 1 ? 1 : -1;

        var newScale = matrix[0] * _zoomButtonScale;
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (mouseDeltaX * delta)), (matrix[5] + (mouseDeltaY * delta)));
        }
    }

    function _zoomOnRightClickSVG(e, drag){
        e.preventDefault();
        var ZOOMMODIFIER = 0.05;
        var MAXZOOM = 10.0;
        var MINZOOM = 0.15;

        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var matrix = _getTransformMatrix(svgHolder);
        var center = _getElementCenter(svgHolder);
        var mouseDeltaX = (center.x - drag.x) * ZOOMMODIFIER;
        var mouseDeltaY = (center.y - drag.y) * ZOOMMODIFIER;

        var delta = (drag.lastY - e.pageY) > 0 ? 1 : (drag.lastY - e.pageY) < 0 ? -1 : 0;

        var newScale = matrix[0] * (1 + (delta * ZOOMMODIFIER));
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (delta * mouseDeltaX)), (matrix[5] + (delta * mouseDeltaY)));
        }
        drag.lastY = e.pageY;
    }

    function _setZoomWindow(){
        _zoomWindow = !_zoomWindow;
        if (_zoomWindow) {
            document.getElementById(_currentCanvasId).style.cursor = "url(" + ThingView.resourcePath + "/cursors/fly_rectangle.cur),auto";
            document.addEventListener('keydown', function(e){
                _zoomWindowEscapeListener(e);
            });
        } else {
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            document.removeEventListener('keydown', function(e){
                _zoomWindowEscapeListener(e);
            });
        }
    }

    function _drawZoomWindow(rectCanvas, zoomDrag, e){
        var boundingClientRect = rectCanvas.getBoundingClientRect();
        var pageX = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
        var pageY = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
        var rectW = (pageX-boundingClientRect.left) - (zoomDrag.x1-boundingClientRect.left);
        var rectH = (pageY-boundingClientRect.top) - (zoomDrag.y1-boundingClientRect.top);
        var context = rectCanvas.getContext('2d');
        context.clearRect(0,0,parseInt(rectCanvas.width),parseInt(rectCanvas.height));
        context.strokeStyle = "#96ed14";
        context.fillStyle = "rgba(204,204,204,0.5)";
        context.lineWidth = 1;
        context.strokeRect((zoomDrag.x1-boundingClientRect.left), (zoomDrag.y1-boundingClientRect.top), rectW, rectH);
        context.fillRect((zoomDrag.x1-boundingClientRect.left), (zoomDrag.y1-boundingClientRect.top), rectW, rectH);
    }

    function _zoomWindowEscapeListener(e){
        if (e.key == "Escape" && _zoomWindow) {
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            if(_IsSVGSession()){
                var svgWrapper = document.getElementById(_currentCanvasId);
                if(svgWrapper.childNodes.length > 1){
                    svgWrapper.removeChild(svgWrapper.childNodes[1]);
                }
            }
            _setZoomWindow();
        }
    }

    function _zoomOnWindowSVG(e, zoomDrag){
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];

        if(zoomDrag.x1 > zoomDrag.x2){
            zoomDrag.x1 = [zoomDrag.x2, zoomDrag.x2=zoomDrag.x1][0];
        }
        if(zoomDrag.y1 > zoomDrag.y2){
            zoomDrag.y1 = [zoomDrag.y2, zoomDrag.y2=zoomDrag.y1][0];
        }

        var width = zoomDrag.x2 - zoomDrag.x1;
        var height = zoomDrag.y2 - zoomDrag.y1;
        var holderAspectRatio = svgHolder.clientWidth / svgHolder.clientHeight;
        var zoomAspectRatio = width / height;
        var zoomModifier = (width > height && holderAspectRatio < zoomAspectRatio) ? (svgHolder.clientWidth / width) - 1 : (svgHolder.clientHeight / height) - 1;

        var center = _getElementCenter(svgHolder);
        var newCenterX = zoomDrag.x1 + width/2;
        var newCenterY = zoomDrag.y1 + height/2;
        var deltaX = (center.x - newCenterX) * (1 + zoomModifier);
        var deltaY = (center.y - newCenterY) * (1 + zoomModifier);

        var matrix = _getTransformMatrix(svgHolder);
        _setTransformMatrix(svgHolder, (matrix[0] * (1 + zoomModifier)), matrix[1], matrix[2], (matrix[0] * (1 + zoomModifier)), (matrix[4] + deltaX), (matrix[5] + deltaY));

    }

    function _zoomOnPinch(e, zoomPinch) {
        var oldHypth = Math.sqrt(Math.pow(zoomPinch.oldXs.x0 - zoomPinch.oldXs.x1,2) + Math.pow(zoomPinch.oldYs.y0 - zoomPinch.oldYs.y1,2));
        var newHypth = Math.sqrt(Math.pow(zoomPinch.newXs.x0 - zoomPinch.newXs.x1,2) + Math.pow(zoomPinch.newYs.y0 - zoomPinch.newYs.y1,2));
        var delta = (newHypth - oldHypth);

        if (delta!=0) {
            var ZOOMMODIFIER = 0.015 * delta;
            var MAXZOOM = 10.0;
            var MINZOOM = 0.15;

            var svgHolder = e.currentTarget.childNodes[0];
            var center = _getElementCenter(svgHolder);
            var mouseDeltaX = (center.x - zoomPinch.xCenter) * ZOOMMODIFIER;
            var mouseDeltaY = (center.y - zoomPinch.yCenter) * ZOOMMODIFIER;

            var matrix = _getTransformMatrix(svgHolder);
            var newScale = matrix[0] * (1 + ZOOMMODIFIER);
            if(newScale <= MAXZOOM && newScale >= MINZOOM){
                _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + mouseDeltaX), (matrix[5] + mouseDeltaY));
            }

            zoomPinch.oldXs.x0 = zoomPinch.newXs.x0;
            zoomPinch.oldXs.x1 = zoomPinch.newXs.x1;
            zoomPinch.oldYs.y0 = zoomPinch.newYs.y0;
            zoomPinch.oldYs.y1 = zoomPinch.newYs.y1;
        }
    }

    function _IsSVGSession()
    {
        var retVal = false;
        if (!_currentCanvasId=="") {
            retVal = _currentCanvasId.indexOf("_CreoViewSVGDiv") != -1 ? true : false;
        }
        return retVal;
    }

    function _LoadSVG(val, callback){
        if(_IsSVGSession())
        {
            var canvasId = _currentCanvasId;
            var svgHolder = document.getElementById(canvasId).childNodes[0];
            _resetTransform(svgHolder);
            svgHolder.innerHTML = val;
            _setCalloutListeners(svgHolder);
            var svg = svgHolder.getElementsByTagName("svg")[0];
            svg.setAttribute('height',"100%");
            svg.setAttribute('width',"100%");
            _calloutsSelected = [];
            _partsSelected = [];
            _calloutColors = [];
            callback(true);
        }
    }

    function _getCallouts(){
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var callouts = svgHolder.querySelectorAll('[class^="callout"]');
        return callouts;
    }

    function _getSVGElementColors(elem, colorsList){
        var colors = [];
        colors[0] = elem.id;
        for (var i = 1; i < elem.childNodes.length; i++){
            colors = _addNodeColor(elem.childNodes[i], colors);
        }
        colorsList.push(colors);
    }

    function _addNodeColor(node, colors){
        var obj = {};
        if(node.nodeName == "path" || node.nodeName == "line" || node.nodeName == "text" || node.nodeName == "polyline"){
            obj.fill = node.getAttribute("fill") ? node.getAttribute("fill") : null;
            obj.stroke = node.getAttribute("stroke") ? node.getAttribute("stroke") : null;
            colors.push(obj);
        } else if(node.nodeName == "g") {
            for (var i = 0; i < node.childNodes.length; i++){
                colors = _addNodeColor(node.childNodes[i], colors);
            }
        }
        return colors;
    }

    function _setCalloutListeners(svgHolder){
        var hotspots = svgHolder.querySelectorAll('[class^="hotspot"]');
        if(hotspots.length==0){
            hotspots = svgHolder.querySelectorAll('[class^="callout"]');
        }
        var startX = 0;
        var startY = 0;
        var touchMoved = false;
        for (var i=0; i < hotspots.length; i++){
            hotspots[i].addEventListener("mousedown", function(e){
                startX = e.pageX;
                startY = e.pageY;
            }, false);
            hotspots[i].addEventListener("mouseup", function(e){
                if(startX == e.pageX && startY == e.pageY){
                    if (!(e.ctrlKey || e.metaKey)) {
                        _deselectAllCallouts();
                    }
                    _toggleCalloutSelection(e);
                }
            }, false);
            hotspots[i].addEventListener("touchstart", function(e){
                touchMoved = false;
            });
            hotspots[i].addEventListener("touchmove", function(e){
                touchMoved = true;
            });
            hotspots[i].addEventListener("touchend", function(e){
                if(!touchMoved){
                    e.stopPropagation();
                    e.preventDefault();
                    if (!(e.ctrlKey || e.metaKey)) {
                        _deselectAllCallouts();
                    }
                    _toggleCalloutSelection(e);
                    touchMoved = false;
                }
            }, {passive: false});
        }
    }

    function _getCalloutForToggle(e){
        var targetClass = e.currentTarget.getAttribute("class");
        if (targetClass.indexOf("callout") != -1){
            return e.currentTarget;
        } else if(targetClass.indexOf("hotspot") != -1){
            var noIndex = targetClass.indexOf("_");
            var calloutNo = targetClass.substr(noIndex);
            var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
            var callouts = svgHolder.querySelectorAll('[class^="callout"]');
            var callout;
            for (var i=0; i<callouts.length; i++){
                if(callouts[i].getAttribute('class').indexOf(calloutNo, callouts[i].getAttribute('class').length - calloutNo.length) != -1){
                    callout = callouts[i];
                }
            }
            return callout;
        } else {
            return;
        }
    }

    function _toggleCalloutSelection(e){
        var callout = _getCalloutForToggle(e);
        if(callout){
            if (_calloutsSelected.indexOf(callout.id) != -1){
                _deselectCallout(callout);
                var index = _calloutsSelected.indexOf(callout.id);
                if (index !=-1){
                    _calloutsSelected.splice(index,1);
                }
            } else {
                _selectCallout(callout);
            }
            if(_svgCalloutCB){
                _svgCalloutCB(callout.id);
            }
        }
    }

    function _setSVGElementColors(callout, mainColor, textColor){
        _setNodeColor(callout.childNodes[0], mainColor, textColor, false);
    }

    function _setNodeColor(node, mainColor, textColor, background){
        if(node){
            if (node.nodeName == "path") {
                if (node.getAttribute("fill")) {
                    node.setAttribute("fill", mainColor);
                    background = true;
                }
            }
            if (node.nodeName == "path" || node.nodeName == "line" || node.nodeName == "polyline") {
                node.setAttribute("stroke", mainColor);
            } else if (node.nodeName == "text") {
                if (background) {
                    node.setAttribute("fill", textColor);
                } else {
                    node.setAttribute("fill", mainColor);
                }
            } else if (node.nodeName == "g"){
                _setNodeColor(node.childNodes[0], mainColor, textColor, background);
                for (var i = 0; i < node.childNodes.length; i++) {
                    if (node.childNodes[i].nodeName == "path" && node.childNodes[i].getAttribute("fill")) {
                        background = true;
                    }
                }
            }
            _setNodeColor(node.nextSibling, mainColor, textColor, background);
        }
    }

    function _resetSVGElementColors (elem, colorsList){
        var colors = [];
        for (var i = 0; i < colorsList.length; i++){
            if (colorsList[i][0] == elem.id) {
                colors = colorsList[i];
                break;
            }
        }
        colors.shift();
        _resetNodeColor(elem.childNodes[0], colors);
        colorsList.splice(colorsList.indexOf(colors), 1);
    }

    function _resetNodeColor (node, colors){
        if (node) {
            if (node.nodeName == "line" || node.nodeName == "path" || node.nodeName == "text" || node.nodeName == "polyline") {
                var obj = colors.shift();
                if(obj.fill != null){
                    node.setAttribute('fill', obj.fill);
                } else {
                    node.removeAttribute('fill');
                }
                if (obj.stroke != null){
                    node.setAttribute('stroke', obj.stroke);
                } else {
                    node.removeAttribute('stroke');
                }
            } else if (node.nodeName == "g") {
                _resetNodeColor(node.childNodes[0], colors);
            }
            _resetNodeColor(node.nextSibling, colors);
        }
    }

    function _selectCallout(callout){
        _getSVGElementColors(callout, _calloutColors);
        _setSVGElementColors(callout, "rgb(102,153,255)", "rgb(255,255,255)");
        _calloutsSelected.push(callout.id);
        var calloutDesc = callout.getElementsByTagName("desc");
        if (calloutDesc.length) {
            var parts = _getSVGParts(calloutDesc[0].textContent);
            if(parts.length > 0){
                _selectSVGPart(parts);
            }
        }
    }

    function _deselectAllCallouts(){
        for (var j=0; j<_calloutsSelected.length; j++){
            var callout = document.getElementById(_calloutsSelected[j]);
            _deselectCallout(callout);
            if(_svgCalloutCB) {
                _svgCalloutCB(callout.id);
            }
        }
        _calloutsSelected = [];
    }

    function _deselectCallout(callout){
        _resetSVGElementColors(callout, _calloutColors);
        var calloutDesc = callout.getElementsByTagName("desc");
        if (calloutDesc.length) {
            var parts = _getSVGParts(calloutDesc[0].textContent);
            if(parts.length > 0){
                _deselectSVGPart(parts);
            }
        }
    }

    function _getSVGParts(partNo){
        return document.getElementsByClassName("part part_" + partNo);
    }

    function _selectSVGPart(parts){
        for (var i = 0; i < parts.length; i++){
            var part = parts.item(i);
            if(part){
                _getSVGElementColors(part, _partColors);
                _setSVGElementColors(part, "rgb(102,153,255)", "rgb(0,0,0)");
                _partsSelected.push(part.id);
            }
        }
    }

    function _deselectSVGPart(parts){
        for (var i = 0; i < parts.length; i++){
            var part = parts.item(i);
            if(part){
                _resetSVGElementColors(part, _partColors);
                var index = _partsSelected.indexOf(part.id);
                if (index !=-1){
                    _partsSelected.splice(index,1);
                }
            }
        }
    }

    //PDF
    function _createPDFSession(parentCanvasId, callback) {

        if(_IsSVGSession()){
            _destroy2DCanvas();
        }
        else if (!_IsPDFSession()){
            ThingView.Hide3DCanvas();
        }
        var head = document.getElementsByTagName('head').item(0);
        if (!document.getElementById("pdfjs")) {
            var script_pdf = document.createElement("SCRIPT");
            script_pdf.src = ThingView.modulePath + "pdfjs/pdf.js";
            script_pdf.id = "pdfjs";
            script_pdf.async = false;
            head.appendChild(script_pdf);

            script_pdf.onload = function() {
                PDFJS.workerSrc = ThingView.modulePath + "pdfjs/pdf.worker.js";
                _buildPDFSession(parentCanvasId, callback);
            };
        } else {
            _buildPDFSession(parentCanvasId, callback);
        }
        return;
    }

    function _buildPDFSession(parentCanvasId, callback){
        _currentCanvasId = "";
        var canvasWrapper = document.createElement("div");
        var parent = document.getElementById(parentCanvasId);
        _parentCanvasId = parentCanvasId;
        parent.style.fontSize = "12pt";
        canvasWrapper.id = parentCanvasId + "_CreoViewDocumentCanvas" + ThingView.GetNextCanvasID();
        canvasWrapper.setAttribute('style', "min-height: 100%; background-color: " + _uiColors.pdfViewer.background + "; position: absolute;");

        var scrollWrapper = document.createElement("div");
        scrollWrapper.id = "CreoDocumentScrollWrapper";
        scrollWrapper.setAttribute('style', "overflow-y: scroll; overflow-x: auto; -ms-overflow-style: scrollbar; position: relative; height: 100%; -webkit-overflow-scrolling: touch; background-color: rgb(128, 133, 142);");
        scrollWrapper.appendChild(canvasWrapper);
        parent.insertBefore(scrollWrapper, parent.childNodes[0]);
        parent.style.overflow = "hidden";
        parent.style.backgroundColor = _uiColors.pdfViewer.background;
        _currentCanvasId = canvasWrapper.id;
        if ((/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || /android/.test(navigator.userAgent)) {
            _printEnabled = false;
            _toolbarGroups.print = false;
        } else if (_printEnabled) {
            _addPdfPrintClass(parent);
        }
        _RemoveDocumentToolbar (parent);
        if (_toolbarEnabled){
            _DisplayDocumentToolbar(parent, _toolbarGroups);
        }
        var drag = {
            x: 0,
            y: 0,
            state: false,
        };

        window.addEventListener("keydown", _changePageOnKey);

        window.addEventListener("resize", _handleBrowserResize);

        window.addEventListener("mouseup", _handleShapeMarkupEditEvent);

        scrollWrapper.addEventListener("scroll", _handlePagesOnScroll);

        scrollWrapper.addEventListener("wheel", _handlePageOnWheel);

        canvasWrapper.addEventListener("wheel", _changePageOnScroll);

        canvasWrapper.addEventListener("mousedown", function(e){
            if (!_documentLoaded) return;

            if (_zoomButton) {
                _zoomButtonPDF();
            } else if (_cursor.current == _cursorTypes.pan && e.button == 0) {
                _handlePanEventPDF(e, drag);
            }

            _removePdfSearchResultHighlights();
        });

        canvasWrapper.addEventListener("mouseup", function(e){
            if (!_documentLoaded) return;

            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });

        canvasWrapper.addEventListener("mousemove", function(e){
            if (!_documentLoaded) return;

            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });

        canvasWrapper.addEventListener("mouseleave", function(e){
            if (drag.state){
                window.addEventListener("mousemove", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
                window.addEventListener("mouseup", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
            }
        });

        canvasWrapper.addEventListener("mouseenter", function(e){
            window.removeEventListener("mousemove", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
            window.removeEventListener("mouseup", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
        });

        var lastTap = 0;
        canvasWrapper.addEventListener("touchend", function(e){
            e.preventDefault();
            if (!_zoomButton) {
                var currTime = new Date().getTime();
                var tapLength = currTime - lastTap;
                if (tapLength < 200 && tapLength > 0){
                        _resetTransformPDF();
                        drag.state = false;
                    }
                lastTap = currTime;
            } else {
                _zoomButtonPDF();
            }
        });

        callback();
    }

    function _getPDFCanvas() {
        var sessionCanvas = document.createElement("canvas");
        sessionCanvas.style.display = "inline-block";
        sessionCanvas.oncontextmenu = function (e) {
            e.preventDefault();
            return false;
        };
        return sessionCanvas;
    }

    function _removeWindowEventListenersPDF() {
        window.removeEventListener("resize", _handleBrowserResize);
        window.removeEventListener("keydown", _changePageOnKey);
        window.removeEventListener("mousemove", function(e){
            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });
        window.removeEventListener("mouseup", function(e){
            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });
        if (_printEnabled) {
            window.removeEventListener('afterprint', _removePdfPrintDiv);
        }
        document.getElementById(_currentCanvasId).parentNode.removeEventListener("scroll", _changePageOnScroll);
        document.getElementById(_currentCanvasId).removeEventListener("mousedown", _checkDeselectPdfAnnotation);
        window.removeEventListener("keydown", _deletePdfAnnotationEvent);
        window.removeEventListener("mouseup", _handleShapeMarkupEditEvent);
    }

    function _handlePanEventPDF(e, drag) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if (e.type == "mousedown") {
            drag.x = e.pageX;
            drag.y = e.pageY;
            drag.state = true;
        } else if (e.type == "mousemove") {
            document.getElementById(_currentCanvasId).style.cursor = "url(" + ThingView.resourcePath + "/cursors/pan.cur),auto";
            _panPDF(e, drag);
        } else if (e.type == "mouseup") {
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            drag.state = false;
        }
    }

    function _panPDF(e, drag) {
        e.preventDefault();
        var deltaX = 0 - (e.pageX - drag.x);
        var deltaY = 0 - (e.pageY - drag.y);
        var scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        var scrollTop = scrollWrapper.scrollTop;
        var scrollLeft = scrollWrapper.scrollLeft;
        scrollWrapper.scrollTop = scrollTop + deltaY;
        scrollWrapper.scrollLeft = scrollLeft + deltaX;
        drag.x = e.pageX;
        drag.y = e.pageY;
    }

    function getPageHeight(page) {
        return (_marginSize + parseFloat(page.clientHeight));
    }

    function _handlePageOnWheel(evt) {
        if (!_documentLoaded) return;

        if (evt && evt.ctrlKey) {
            _zoomToCursor(evt);
            evt.preventDefault();
            return;
        }
    }

    function _changePageOnScroll(evt) {
        if (!_documentLoaded) return;

        if (evt && evt.ctrlKey) {
            evt.preventDefault();
            return;
        }

        var canvasWrapper = document.getElementById(_currentCanvasId);
        var wrapperHeight = canvasWrapper.parentNode.clientHeight;
        var scrollTop = canvasWrapper.parentNode.scrollTop;
        var scrollBottom = canvasWrapper.parentNode.scrollHeight - scrollTop - wrapperHeight;
        var firstPageQuarterHeight = document.getElementById("PdfPageDisplayWrapper1").offsetHeight / 4;
        var lastPageQuarterHeight = document.getElementById("PdfPageDisplayWrapper"+__TOTAL_PAGES).offsetHeight / 4;
        if (scrollTop < firstPageQuarterHeight) {
            __CURRENT_PAGE = 1;
        } else if (scrollBottom < lastPageQuarterHeight) {
            __CURRENT_PAGE = __TOTAL_PAGES;
        } else {
            var scrollCenter = scrollTop + wrapperHeight / 2;
            for (var i=1; i<=__TOTAL_PAGES; i++) {
                var pageWrapper = document.getElementById("PdfPageDisplayWrapper" + i);

                var offsetTop = pageWrapper.offsetTop;
                var offsetBottom = pageWrapper.offsetTop + pageWrapper.offsetHeight + _marginSize;
                if (offsetTop <= scrollCenter && scrollCenter < offsetBottom) {
                    __CURRENT_PAGE = i;
                    break;
                }
            }
        }

        __CURRENT_PAGE = Math.max(1, __CURRENT_PAGE);
        __CURRENT_PAGE = Math.min(__CURRENT_PAGE, __TOTAL_PAGES);

        _updateDocumentToolbarPageDisplay();
        if (_pdfCallback) {
            _pdfCallback(true);
        }
    }

    function _getPageBufferSize(mode, pagesPerLine) {
        if (pagesPerLine < 4) {
            switch (mode) {
            default:
            // case 0 : refreshing pages so return reduced size 2
            case 0:
                return 2;
            // case 1 : scrolling pages so return usual 5
            case 1:
                if (_getLargestPageWidth() > _getLargestPageHeight()) {
                    return 5;
                }
                return 3;
            // case 2 : jump to page without refreshing pages
            case 2:
                return 0;
            }
        } else {
            return (2*pagesPerLine - 1);
        }
    }

    function _updateNavbar() {
        if (_sidebarEnabled && _navbar.enabled) {
            _selectNavPage(document.getElementById("PdfNavPageWrapper" + __CURRENT_PAGE), __CURRENT_PAGE);
            _scrollNavbarToPage(document.getElementById("CreoViewDocumentNavbar"), __CURRENT_PAGE);
        }
    }

    function _handlePagesOnScroll() {
        if (!_documentLoaded) return;
        _changePageOnScroll();
        if (!_ignoreScrollEvent){
            var pagesPerLine = _getNoPagesPerLine(__CURRENT_PAGE);
            var pageBufferSize = _getPageBufferSize(1, pagesPerLine);
            if (!document.getElementById("PdfPageDisplayWrapper" + __CURRENT_PAGE).firstChild) {
                _ignoreScrollEvent = true;
                showPage(__CURRENT_PAGE, function() {
                    _ignoreScrollEvent = false;
                    _showSearchResultHighlight();
                    _updateNavbar();
                }, 0);
            } else if(__CURRENT_PAGE + pagesPerLine > (_lastLoadedPage - 1) && __CURRENT_PAGE < __TOTAL_PAGES - pagesPerLine) {
                _ignoreScrollEvent = true;
                _firstLoadedPage = Math.max((__CURRENT_PAGE-pageBufferSize), 1);
                _lastLoadedPage  = Math.min(__CURRENT_PAGE + pageBufferSize + 1, __TOTAL_PAGES);
                generateOrderToShowPages(1);
                showPagesOnOrder(function() {
                    _ignoreScrollEvent = false;
                    _showSearchResultHighlight();
                    clearInvisibleWrappers();
                    _updateNavbar();
                });
            } else if (__CURRENT_PAGE - (2*pagesPerLine - 1) < _firstLoadedPage && __CURRENT_PAGE > (2*pagesPerLine - 1)) {
                _ignoreScrollEvent = true;
                _firstLoadedPage = Math.max((__CURRENT_PAGE - pageBufferSize), 1);
                _lastLoadedPage  = Math.min(__CURRENT_PAGE + pageBufferSize, __TOTAL_PAGES);
                generateOrderToShowPages(-1);
                showPagesOnOrder(function() {
                    _ignoreScrollEvent = false;
                    _showSearchResultHighlight();
                    clearInvisibleWrappers();
                    _updateNavbar();
                });
            } else if (_sidebarEnabled && _navbar.enabled) {
                _updateNavbar();
            }
        } else {
            if (_scrollTimer !== null) {
                clearTimeout(_scrollTimer);
                _scrollTimer = null;
            }
            _scrollTimer = setTimeout(function() {
                var currentPage = document.getElementById("PdfPageDisplayWrapper" + __CURRENT_PAGE);
                if (currentPage && !currentPage.childElementCount) {
                    _ignoreScrollEvent = true;
                    showPage(__CURRENT_PAGE, function() {
                        _ignoreScrollEvent = false;
                        clearInvisibleWrappers();
                        _updateNavbar();
                    }, 0);
                }
            }, 100);
        }
    }

    function _changePageOnKey(e) {
        if (!_documentLoaded) return;

        var keyPressed = e.key;
        if (keyPressed == "ArrowRight") {
            _LoadNextPage(_pdfCallback);
        } else if (keyPressed == "ArrowLeft") {
            _LoadPrevPage(_pdfCallback);
        } else if (keyPressed == "Home") {
            _LoadPage(_pdfCallback, 1);
        } else if (keyPressed == "End") {
            _LoadPage(_pdfCallback, __TOTAL_PAGES);
        } else if (e.keyCode == 189 && e.ctrlKey) { // '-'
            _zoomButtonScale = _zoomOutScale;
            _zoomButtonPDF();
            e.preventDefault();
        } else if (e.keyCode == 187 && e.ctrlKey) {// '='
            _zoomButtonScale = _zoomInScale;
            _zoomButtonPDF();
            e.preventDefault();
        }
    }

    function _zoomToCursor(evt) {
        if (_refreshingPDF) return;

        var newScale = __ZOOMSCALE * (evt.deltaY > 0 ? _zoomOutScale : _zoomInScale);
        if (newScale <= 0.5)
            return;

        var scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        var wrapperRect = scrollWrapper.getBoundingClientRect();
        var x = evt.clientX - wrapperRect.left;
        var y = evt.clientY - wrapperRect.top;

        _getScrollCenterData(newScale, {x:x,y:y});
        __ZOOMSCALE = newScale;

        _refreshPDF(function(success){
            if (success) {
                if (_pdfCallback) {
                    _pdfCallback(success);
                }
            }
        }, {zoomScale: newScale});
    }

    function _zoomButtonPDF() {
        if (_zoomButtonScale < 1.0 && __ZOOMSCALE * _zoomButtonScale <= 0.5) {
            return;
        }

        var newScale = __ZOOMSCALE * _zoomButtonScale;
        _getScrollCenterData(newScale);
        __ZOOMSCALE = newScale;

        _refreshPDF(function(success){
            if (success) {
                if (_pdfCallback) {
                    _pdfCallback(success);
                }
            }
        }, {zoomScale: newScale});
    }

    function _resetTransformPDF () {
        if(_cursor.current != _cursorTypes.text){
            _setPageModePDF();
        }
    }

    function _adjustWrapperSize() {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var canvasWrapperWidth = _getLargestPageWidth() + _marginSize * 2;
        canvasWrapper.style.width = canvasWrapperWidth + "px";
        canvasWrapper.style.left = Math.max((canvasWrapper.parentNode.clientWidth - canvasWrapperWidth)/2, 0) + "px";
    }

    function _refreshPDF(callback, value) {
        if (_refreshingPDF) {
            _nextRefreshEvent = value;
            callback(false);
            return;
        }

        if (value) {
            if (value.zoomScale)
                __ZOOMSCALE = value.zoomScale;
            if (value.pageRotation)
                _pageRotation = value.pageRotation;
        }

        _ignoreScrollEvent = true;
        _refreshingPDF = true;

        var tempPage = __CURRENT_PAGE;
        _largestWidth = _largestHeight = 0;
        _getTextSelection();
        _resizePageWrapper(1, function() {
            _adjustWrapperSize();
            _applyScrollData();
            var pagesPerLine = _getNoPagesPerLine(__CURRENT_PAGE);
            if (pagesPerLine > 1) {
                for (var i = 1; i < pagesPerLine; i++) {
                    __CURRENT_PAGE -= 1;
                    if (__CURRENT_PAGE <= 1) {
                        __CURRENT_PAGE = 1;
                        break;
                    }
                }
            }
            showPage(tempPage, function(){
                _showSearchResultHighlight();
                _showTextSelection();
                _ignoreScrollEvent = false;
                _changePageOnScroll();
                _refreshingPDF = false;
                if (_nextRefreshEvent) {
                    _refreshPDF(callback, _nextRefreshEvent);
                    _nextRefreshEvent = null;
                } else {
                    _setUserSelect();
                    _displayPdfAnnotations(_pdfParsedAnnotationSet);
                    callback(true);
                }
            }, 0);
        });
    }

    function _getLargestPageWidth() {
        return _largestWidth;
    }

    function _getLargestPageHeight() {
        return _largestHeight;
    }

    function _getPageWidth(canvasWrapper, pageNo) {
        var page = canvasWrapper.childNodes[pageNo-1];
        if (page) {
            return parseFloat(page.width);
        }
    }

    function _getPageHeight(canvasWrapper, pageNo) {
        var page = canvasWrapper.childNodes[pageNo-1];
        if (page) {
            return parseFloat(page.height);
        }
    }

    function _setPageModePDF(callback) {
        if (callback == null) {
            callback = _pdfCallback;
        }

        var canvasWrapper = document.getElementById(_currentCanvasId);
        var pageWidthScale  = (canvasWrapper.parentNode.clientWidth  - _marginSize * 2) / _getLargestPageWidth()  * __ZOOMSCALE;
        var pageHeightScale = (canvasWrapper.parentNode.clientHeight - _marginSize * 2) / _getLargestPageHeight() * __ZOOMSCALE;

        var scale = __ZOOMSCALE;
        _getScrollTopData(scale);
        switch (_pageMode) {
            case "FitPage":
                scale = pageHeightScale;
                break;
            case "FitWidth":
                scale = pageWidthScale;
                break;
            case "FitZoomAll":
                scale = Math.min(pageWidthScale, pageHeightScale);
                break;
            case "Original":
            case "100percent":
                scale = 1;
                break;
            case "500percent":
                scale = 5;
                break;
            case "250percent":
                scale = 2.5;
                break;
            case "200percent":
                scale = 2;
                break;
            case "75percent":
                scale = 0.75;
                break;
            case "50percent":
                scale = 0.5;
                break;
            default:
                console.log("Requested Page Mode is not supported");
                return;
        }

        if (Math.abs(__ZOOMSCALE - scale) > 0.001) {
            _getScrollTopData(scale);
            __ZOOMSCALE = scale;

            _refreshPDF(function(success){
                if (success) {
                    callback();
                }
            }, {zoomScale: __ZOOMSCALE});
        }

        _updateToolbarPageModeSelection();
    }

    function _updateToolbarPageModeSelection() {
        if (_toolbarEnabled && !_miniToolbar && _toolbarGroups.zoom) {
            var pageModeSelect = document.getElementById("CreoViewDocToolbarPageModeSelect");
            if (pageModeSelect) {
                document.getElementById("CreoViewDocToolbarPageModeSelect").value = _pageMode;
            }
        }
    }

    function _IsPDFSession() {
        var retVal = false;
        if (_currentCanvasId != "") {
            retVal = _currentCanvasId.indexOf("_CreoViewDocumentCanvas") != -1 ? true : false;
        }
        return retVal;
    }

    function _initializeTemplates() {
        _pageWrapperTemplate = null;
        _textLayerTemplate = null;
        _annotationTemplate = null;
        _canvasTemplate = null;
        _navWrapperTemplate = null;

        _printDivTemplate = null;
        _printWrapperTemplate = null;
        _printPageTemplate = null;
        _printMarkupTemplate = null;

        _prefetchedPage = null;
        _printCallback = null;
    }

    function _LoadPDF(val, isUrl, callback, isWindowless) {
        if(_IsPDFSession() && val) {
            _ignoreScrollEvent = true;
            __ZOOMSCALE = 1;
            __CURRENT_PAGE = 1;
            _pageRotation = 0;
            _pdfRawAnnotationSet = null;
            _pdfParsedAnnotationSet = [];
            _markupMode.selectedAnnotations = [];
            _markupMode.hiddenSelectedAnnotations = [];
            _pageAnnoSetList = {};
            _markupHistory = {stack: [], index: -1};
            var canvasWrapper = document.getElementById(_currentCanvasId);
            if (_sidebarEnabled){
                _RemovePdfSideBar(canvasWrapper.parentNode.parentNode);
            }
            while(canvasWrapper.firstChild){
                canvasWrapper.removeChild(canvasWrapper.firstChild);
            }

            var removePasswordDialog = function() {
                var pwBGElem = document.getElementById("PasswordBackground");
                if (pwBGElem) {
                    pwBGElem.parentNode.removeChild(pwBGElem);
                }
            };
            var loadingTask;
            if (isUrl)
                loadingTask = PDFJS.getDocument(val);
            else
                loadingTask = PDFJS.getDocument({ data: val });
            loadingTask.onPassword = function(updatePassword, reason) {
                if (reason === PDFJS.PasswordResponses.NEED_PASSWORD) {
                    if (isWindowless == true) {
                        callback(false);
                        return;
                    }
                    if (document.getElementById("PasswordBackground") == null) {
                        var passwordBG = document.createElement("div");
                        passwordBG.id = "PasswordBackground";
                        passwordBG.setAttribute('style', "width: 100%; height: 100%; background-color: lightgrey; overflow: hidden; position: absolute; top: 0px; left: 0px;");

                        var passwordDiv = document.createElement("div");
                        passwordDiv.id = "PasswordContainer";
                        passwordDiv.setAttribute('style', "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border: 1px solid black; padding: 20px 20px 10px; margin: 3px; background-color: white;");
                        passwordBG.appendChild(passwordDiv);

                        var passwordTitle = document.createElement("div");
                        passwordTitle.setAttribute('style', "text-align: left; margin-bottom: 10px; display: block;");
                        passwordTitle.innerHTML = "Please enter a password.";
                        passwordDiv.appendChild(passwordTitle);

                        var passwordInputDiv = document.createElement("div");
                        passwordInputDiv.style.marginBottom = "10px";
                        passwordInputDiv.style.display = "block";
                        passwordDiv.appendChild(passwordInputDiv);

                        var passwordInput = document.createElement("input");
                        passwordInput.type = "password";
                        passwordInput.id = "PasswordInput";
                        passwordInput.autocomplete = "off";
                        passwordInput.style.width = "240px";
                        passwordInputDiv.appendChild(passwordInput);

                        var passwordButtonDiv = document.createElement("div");
                        passwordButtonDiv.setAttribute('style', "display: block; height: 20px; margin-bottom: 10px;");
                        passwordDiv.appendChild(passwordButtonDiv);

                        var passwordOK = document.createElement("button");
                        passwordOK.id = "PasswordOK";
                        passwordOK.innerHTML = "OK";
                        passwordOK.setAttribute('style', "width: 120px; height: 20px; float: left; margin-right: 3px;");
                        passwordButtonDiv.appendChild(passwordOK);

                        var passwordCancel = document.createElement("button");
                        passwordCancel.id = "PasswordCancel";
                        passwordCancel.innerHTML = "Cancel";
                        passwordCancel.setAttribute('style', "width: 120px; height: 20px; float: right;");
                        passwordButtonDiv.appendChild(passwordCancel);

                        var passwordMessage = document.createElement("div");
                        passwordMessage.id = "PasswordMessage";
                        passwordMessage.setAttribute('style', "display: block; color: red; text-align: left; margin-bottom: 10px;");
                        passwordDiv.appendChild(passwordMessage);

                        var parent = canvasWrapper.parentNode;
                        parent.appendChild(passwordBG);

                        passwordInput.addEventListener("keyup", function(e) {
                            if (e.keyCode === 13) { // return key
                                e.preventDefault();
                                document.getElementById("PasswordOK").click();
                            }
                        });
                        passwordOK.addEventListener("click", function(e) {
                            var pwInputElem = document.getElementById("PasswordInput");
                            var pw = pwInputElem.value;
                            pwInputElem.value = '';
                            updatePassword(pw.length ? pw : ' ');
                        });
                        passwordCancel.addEventListener("click", function(e) {
                            removePasswordDialog();
                        });
                    }
                } else if (reason === PDFJS.PasswordResponses.INCORRECT_PASSWORD) {
                    document.getElementById("PasswordMessage").innerHTML = 'That password is incorrect.<br>Please try again.';
                }
            };

            loadingTask.then(function(pdf_doc) {
                removePasswordDialog();

                __PDF_DOC = pdf_doc;
                __TOTAL_PAGES = __PDF_DOC.numPages;
                _firstLoadedPage = 1;
                _lastLoadedPage = Math.min(__TOTAL_PAGES, 3);
                _largestWidth = _largestHeight = 0;
                _resetSearchVariables();
                _initializeTemplates();
                generateOrderToShowPages(1);
                _preCalculateZoomScale(canvasWrapper, function() {
                    _preparePageWrapper(canvasWrapper, 1, function() {
                        _adjustWrapperSize();
                        _scrollToHorizontalCenter();
                        showPagesOnOrder(function(success) {
                            __PDF_DOC.getOutline().then(function(outline){
                                if(outline){
                                    _bookmarks = outline;
                                } else {
                                    _bookmarksBar.enabled = false;
                                    _navbar.enabled = true;
                                }
                                if (_sidebarEnabled) {
                                    if (_navbar.enabled) {
                                        _DisplayPdfNavigationBar (_CreateSideBar(canvasWrapper.parentNode.parentNode), 1);
                                    } else if (_bookmarksBar.enabled) {
                                        _DisplayPdfBookmarksBar(_CreateSideBar(canvasWrapper.parentNode.parentNode));
                                    }
                                }
                                if (_toolbarEnabled) {
                                    _resizeDocumentToolbar(canvasWrapper.parentNode.parentNode, _toolbarGroups);
                                    _updateDocumentToolbarPageDisplay();
                                }
                                _setUserSelect();
                                _ignoreScrollEvent = false;
                                _documentLoaded = true;
                                if (callback) {
                                    callback(success);
                                }
                            });
                        });
                    });
                });
            }).catch(function(error) {
                console.log("Javascript caught exception in showPDF : " + error.message);
                if (typeof callback === "function") callback(false);
            });
        }
    }

    function _preCalculateZoomScale(canvasWrapper, callback) {
        __PDF_DOC.getPage(1).then(function(page){
            var viewport = page.getViewport(1);
            var pageWidth = parseFloat(viewport.width);
            var pageHeight = parseFloat(viewport.height);

            var pageWidthScale  = (canvasWrapper.parentNode.clientWidth  - _marginSize * 2)  / pageWidth;
            var pageHeightScale = (canvasWrapper.parentNode.clientHeight - _marginSize * 2) / pageHeight;

            var scale = __ZOOMSCALE;
            switch(_pageMode) {
            case "FitPage":
                scale = pageHeightScale;
                break;

            case "FitWidth":
                scale = pageWidthScale;
                break;
            }

            __ZOOMSCALE = scale;

            _updateToolbarPageModeSelection();

            callback();
        });
    }

    function _resizePageWrapper(pageNo, callback) {
        var pageWrapper = document.getElementById("PdfPageDisplayWrapper" + pageNo);
        if (pageWrapper) {
            while (pageWrapper.firstChild) {
                pageWrapper.removeChild(pageWrapper.firstChild);
            }

            __PDF_DOC.getPage(pageNo).then(function(page) {
                var viewport = page.getViewport(__ZOOMSCALE, _pageRotation);
                var width = parseFloat(viewport.width);
                var height = Math.floor(parseFloat(viewport.height));
                _largestWidth = Math.max(_largestWidth, width);
                _largestHeight = Math.max(_largestHeight, height);
                pageWrapper.height = height + "px";
                pageWrapper.width = width + "px";
                pageWrapper.style.height = height + "px";
                pageWrapper.style.width = width + "px";
                pageWrapper.style.margin = _marginSize + "px auto";

                if (pageNo < __TOTAL_PAGES) {
                    _resizePageWrapper(pageNo+1, callback);
                } else {
                    if (callback) {
                        callback();
                    }
                }
            });
        }
    }

    function _preparePageWrapper(canvasWrapper, pageNo, callback) {
        __PDF_DOC.getPage(pageNo).then(function(page){
            var viewport = page.getViewport(__ZOOMSCALE);

            var height = Math.floor(parseFloat(viewport.height));
            var width = parseFloat(viewport.width);
            _largestWidth = Math.max(_largestWidth, width);
            _largestHeight = Math.max(_largestHeight, height);

            var pageWrapper = null;
            if (_pageWrapperTemplate == null) {
                pageWrapper = document.createElement("div");
                pageWrapper.height = height + "px";
                pageWrapper.width = width + "px";
                pageWrapper.setAttribute('style', "width: " + width + "px; height: " + height + "px; margin: " + _marginSize + "px auto; background-color: white; box-shadow: 0px 0px 6px rgba(0,0,0,0.5); position: relative;");
                pageWrapper.style.display = "block";
                pageWrapper.id = "PdfPageDisplayWrapper" + pageNo;
                pageWrapper.className = "PdfPageDisplayWrapper";

                _pageWrapperTemplate = pageWrapper.cloneNode(false);
            } else {
                pageWrapper = _pageWrapperTemplate.cloneNode(false);

                pageWrapper.height = height + "px";
                pageWrapper.width = width + "px";
                pageWrapper.style.height = height + "px";
                pageWrapper.style.width = width + "px";
                pageWrapper.id = "PdfPageDisplayWrapper" + pageNo;
            }
            canvasWrapper.appendChild(pageWrapper);
            if (pageNo < __TOTAL_PAGES) {
                _preparePageWrapper(canvasWrapper, pageNo+1, callback);
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    }

    function handleNextPageOnOrder(callback) {
        var pageNo = _orderToShowPages.shift();
        if (pageNo) {
            __PDF_DOC.getPage(pageNo).then(function(newPage){
                handlePage(newPage, callback);
            });
        } else {
            if (!_refreshingPDF) {
                var annoSet = [];
                for (var j = _firstLoadedPage; j <= _lastLoadedPage; j++) {
                    if (_pageAnnoSetList[j]) {
                        for (var i=0; i<_pageAnnoSetList[j].length; i++) {
                            annoSet.push(_pdfParsedAnnotationSet[_pageAnnoSetList[j][i]]);
                        }
                    }
                }
                _displayPdfAnnotations(annoSet);
            }
            if (callback) {
                callback(true);
            }
        }
    }

    function getTextLayer(pageNo, width, height) {
        var textLayer = null;
        if (_textLayerTemplate == null) {
            textLayer = document.createElement("div");
            textLayer.className = "PdfPageDisplayTextLayer";
            textLayer.setAttribute('style', "overflow: hidden; position: absolute; color: transparent; z-index: 3; top: 0px; left: 0px; white-space: pre");

            _textLayerTemplate = textLayer.cloneNode(false);
        } else {
            textLayer = _textLayerTemplate.cloneNode(false);

        }
        textLayer.id = "PdfPageDisplayTextLayer" + pageNo;
        textLayer.width  = width;
        textLayer.height = height;
        textLayer.style.width  = width + "px";
        textLayer.style.height = height + "px";
        textLayer.style.opacity = "0.2";

        var drag = {x: 0, y: 0};
        textLayer.addEventListener("mousedown", function(e){
            _handleMarkupSelectionCheck(e, drag);
        });
        textLayer.addEventListener("mouseup", function(e){
            _handleMarkupSelectionCheck(e, drag);
        });

        return textLayer;
    }

    function handlePage(page, callback) {
        var pageNo = page.pageNumber;
        var viewport = page.getViewport(__ZOOMSCALE, _pageRotation);
        var pageWrapper = document.getElementById("PdfPageDisplayWrapper" + pageNo);
        if (pageWrapper.childElementCount == 0) {
            var canvas = _getPDFCanvas();
            canvas.id = "PdfPageDisplayCanvas" + pageNo;
            canvas.className = "PdfPageDisplayCanvas";
            var height = parseFloat(viewport.height);
            var width = parseFloat(viewport.width);
            canvas.height = height;
            canvas.width = width;
            page.render({canvasContext: canvas.getContext('2d'), viewport: viewport}).then(function(){
                if (pageWrapper.childElementCount == 0)
                    pageWrapper.appendChild(canvas);
                var textLayer = getTextLayer(pageNo, width, height);
                if (pageWrapper.childElementCount == 1) {
                    pageWrapper.appendChild(textLayer);

                    page.getTextContent({ normalizeWhitespace: true }).then(function(textContent){
                        var lineContainers = [];
                        PDFJS.renderTextLayer({
                            textContent: textContent,
                            container: textLayer,
                            viewport: viewport,
                            textDivs: lineContainers,
                            enhanceTextSelection: true
                        })._capability.promise.then(function(){
                            for (var i=lineContainers.length-1; i >= 0; i--) {
                                var textDivLeft = parseFloat(lineContainers[i].style.left);
                                var textDivRight = textDivLeft + parseFloat(lineContainers[i].width);
                                var textDivTop = parseFloat(lineContainers[i].style.top);
                                var textDivBottom = textDivTop + parseFloat(lineContainers[i].height);
                                if (textDivLeft > width || textDivRight < 0 ||
                                    textDivTop > height || textDivBottom < 0) {
                                    textLayer.removeChild(lineContainers[i]);
                                } else {
                                    lineContainers[i].style.position = "absolute";
                                    lineContainers[i].style.lineHeight = "1.0";
                                    lineContainers[i].style.transformOrigin = "left top 0px";
                                    lineContainers[i].id = textLayer.id + "_" + (i+1).toString();
                                    lineContainers[i].className = "PdfPageDisplayTextContainer";
                                }
                            }
                            handleNextPageOnOrder(callback);
                        });
                    });
                } else {
                    handleNextPageOnOrder(callback);
                }
            });
        } else {
            handleNextPageOnOrder(callback);
        }
    }

    function gotoBookmark(page_no, coordinate, callback) {
        if ((page_no > 0) && (page_no <=__TOTAL_PAGES)) {
            if(!_ignoreScrollEvent) {
                _ignoreScrollEvent = true;

                _scrollToPage(page_no, function() {
                    showPage(page_no, function() {
                        _ignoreScrollEvent = false;
                        _changePageOnScroll();
                        _updateNavbar();
                        callback(true);
                    }, 0);
                }, coordinate);
            }
        } else {
            callback(false);
        }
    }

    function gotoPage(page_no, callback) {
        if(!_ignoreScrollEvent) {
            _ignoreScrollEvent = true;

            _scrollToPage(page_no, function() {
                showPage(page_no, function() {
                    _ignoreScrollEvent = false;
                    _changePageOnScroll();
                    _updateNavbar();
                    if (callback)
                        callback(true);
                }, 0);
            });
        }
    }

    function generateOrderToShowPages(type, center) {
        var arr = [];
        var first = _firstLoadedPage,
            last  = _lastLoadedPage,
            size  = last - first + 1;
        if (type == 1) {
            // Top down
            while (arr.length < size) {
                arr.push(first++);
            }
        } else if (type == -1) {
            // Bottom up
            while (arr.length < size) {
                arr.push(last--);
            }
        } else if (type == 0 || type == 3) {
            // Center first
            var multiplier = -1;
            var index = 0;
            var curPage = center;
            while (arr.length < size) {
                curPage = curPage + index * multiplier;
                if (curPage >= first && curPage <= last)
                arr.push(curPage);

                index += 1;
                multiplier *= -1;
            }
            if (type == 3) {
                // except center
                arr.shift();
            }
        } else if (type == 2) {
            arr.push(center);
        }
        _orderToShowPages = _orderToShowPages.concat(arr);
    }

    function clearInvisibleWrappers() {
        var pageWrappers = document.getElementsByClassName("PdfPageDisplayWrapper");
        for (var i = 0; i < pageWrappers.length; i++) {
            var pageNo = (i+1);
            if (pageNo < _firstLoadedPage || pageNo > _lastLoadedPage) {
                while (pageWrappers[i].firstChild) {
                    pageWrappers[i].removeChild(pageWrappers[i].firstChild);
                }
            }
        }
    }

    function showPagesOnOrder(callback) {
        var pageNo = _orderToShowPages.shift();
        if(pageNo) {
            __PDF_DOC.getPage(pageNo).then(function(page) {
                handlePage(page, function(success) {
                    if (callback) {
                        callback(true);
                    }
                });
            });
        }
    }

    function showPage(page_no, callback, mode) {
        var pagesPerLine = _getNoPagesPerLine(page_no);
        var pageBufferSize = _getPageBufferSize(mode == 2 ? 2 : 0, pagesPerLine);
        _firstLoadedPage = Math.max((page_no-pageBufferSize), 1);
        _lastLoadedPage = Math.min((page_no + pageBufferSize), __TOTAL_PAGES);

        generateOrderToShowPages(mode, page_no);
        showPagesOnOrder(function(success) {
            if (mode != 2) {
                clearInvisibleWrappers();
            }
            if (callback) {
                callback(true);
            }
        });
    }

    function _scrollToHorizontalCenter() {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var offset = (canvasWrapper.parentNode.scrollWidth - canvasWrapper.parentNode.clientWidth) / 2;
        canvasWrapper.parentNode.scrollLeft = offset;
    }

    function _getScrollCenterData(scale, mouse) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var screenScrollY = canvasWrapper.parentNode.scrollTop;
        var screenScrollX = canvasWrapper.parentNode.scrollLeft;
        var centerOffsetX = 0;
        var centerOffsetY = 0;
        if (mouse == null) {
            centerOffsetX = canvasWrapper.parentNode.clientWidth / 2;
            centerOffsetY = canvasWrapper.parentNode.clientHeight / 2;
        } else {
            centerOffsetX = mouse.x;
            centerOffsetY = mouse.y;
        }

        var offsetX = 0;
        if (mouse == null) {
            if (canvasWrapper.parentNode.scrollWidth > canvasWrapper.parentNode.clientWidth) {
                offsetX = (screenScrollX + centerOffsetX - _marginSize) * scale / __ZOOMSCALE - centerOffsetX + _marginSize;
            } else {
                offsetX = -1;
            }
        } else {
            offsetX = (screenScrollX + centerOffsetX - _marginSize) * scale / __ZOOMSCALE - centerOffsetX + _marginSize;
        }

        var pageNo = 1;
        var offsetY = 0;
        var height = 0;
        var pdfDisplays = document.getElementsByClassName("PdfPageDisplayWrapper");
        for (var i = 0; i < pdfDisplays.length;i++) {
            var pageHeight = getPageHeight(pdfDisplays[i]);

            if ((height + pageHeight) > screenScrollY) {
                pageNo = (i+1);
                offsetY = screenScrollY - height + centerOffsetY;
                if (offsetY < _marginSize) {
                    offsetY -= 10;
                } else {
                    offsetY = (offsetY - _marginSize) * scale / __ZOOMSCALE - centerOffsetY;
                }
                break;
            }

            height += pageHeight;
        }

        _scrollOffset = {pageNo: pageNo, offsetX: offsetX, offsetY: offsetY};
    }

    function _getScrollTopData(scale) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var screenScroll = canvasWrapper.parentNode.scrollTop;

        var pageNo = 1;
        var offset = 0;
        var height = 0;
        var pdfDisplays = document.getElementsByClassName("PdfPageDisplayWrapper");
        for (var i = 0; i < pdfDisplays.length;) {
            var pagesPerLine = _getNoPagesPerLine(i+1);
            var pageHeight = getPageHeight(pdfDisplays[i]);

            if ((height + pageHeight) > screenScroll) {
                pageNo = (i+1);
                offset = screenScroll - height;
                if (offset < _marginSize) {
                    offset -= 10;
                } else {
                    offset = (offset - _marginSize) * scale / __ZOOMSCALE;
                }
                break;
            }

            height += pageHeight;
            i += pagesPerLine;
        }

        _scrollOffset = {pageNo: pageNo, offsetX: -1, offsetY: offset};
    }

    function _applyScrollData() {
        if (_scrollOffset) {
            var canvasWrapper = document.getElementById(_currentCanvasId);
            var scrollToY = _marginSize;

            var pdfDisplays = document.getElementsByClassName("PdfPageDisplayWrapper");
            for (var i = 1; i < _scrollOffset.pageNo;) {
                var pagesPerLine = _getNoPagesPerLine(i+1);
                var pageHeight = getPageHeight(pdfDisplays[i-1]);

                scrollToY += pageHeight;

                i += pagesPerLine;
            }

            scrollToY += _scrollOffset.offsetY;

            canvasWrapper.parentNode.scrollTop  = scrollToY;
            if (_scrollOffset.offsetX == -1) {
                var offset = (canvasWrapper.parentNode.scrollWidth - canvasWrapper.parentNode.clientWidth) / 2;
                canvasWrapper.parentNode.scrollLeft = offset;
            } else {
                canvasWrapper.parentNode.scrollLeft = _scrollOffset.offsetX;
            }

            _scrollOffset = null;
        }
    }

    function _scrollToPage(page_no, callback, coordinate){
        __CURRENT_PAGE = page_no;
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var targetPage = document.getElementById("PdfPageDisplayWrapper" + page_no);
        var scrollToVal = targetPage.offsetTop - _marginSize;

        if (coordinate) {
            if (coordinate[1].name == "XYZ") {
                // bookmark
                if (Math.abs(_pageRotation) == 0) {
                    var scrollTopAdjust = _marginSize + parseFloat(targetPage.clientHeight) - coordinate[3] * __ZOOMSCALE;
                    scrollToVal += scrollTopAdjust;
                    canvasWrapper.parentNode.scrollLeft = _marginSize + coordinate[2] * __ZOOMSCALE;
                }
            } else {
                // search result
                canvasWrapper.parentNode.scrollLeft = Math.max(coordinate[2] - canvasWrapper.parentNode.clientWidth / 2, 0);
                scrollToVal += (coordinate[3] - canvasWrapper.parentNode.clientHeight / 2);
            }
        }

        canvasWrapper.parentNode.scrollTop = Math.max(scrollToVal, 0);
        _updateDocumentToolbarPageDisplay();
        if (callback) {
            callback(true);
        }
    }

    function _getNoPagesPerLine(page_no) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        if (canvasWrapper.childNodes[0].style.display == "block") {
            return 1;
        }
        var wrapperWidth = canvasWrapper.clientWidth;
        var sum = 0;
        var count = 0;
        for (var i = 0; i < page_no; i++) {
            var page = canvasWrapper.childNodes[i];
            if (page) {
                sum += parseFloat(page.width) + _marginSize;
                count += 1;
                if (sum > wrapperWidth) {
                    sum = parseFloat(page.width);
                    count = 1;
                }
            }
        }
        for (var j = page_no; j < canvasWrapper.childNodes.length; j++) {
            var page = canvasWrapper.childNodes[j];
            if (page) {
                sum += parseFloat(page.width) + _marginSize;
                if (sum > wrapperWidth) {
                    break;
                }
                count += 1;
            }
        }
        return count;
    }

    function _setUserSelect(){
        var elems = document.getElementsByClassName("PdfPageDisplayTextLayer");
        for (var i = 0; i < elems.length; i++) {
            elems[i].style.WebkitUserSelect = _cursor.current == _cursorTypes.text ? _cursorTypes.text : "none";
            elems[i].style.msUserSelect = _cursor.current == _cursorTypes.text ? _cursorTypes.text : "none";
            elems[i].style.MozUserSelect = _cursor.current == _cursorTypes.text ? _cursorTypes.text : "none";
        }

        if (_cursor.current != _cursorTypes.text) {
            // Clear all text selection
            _clearTextSelection();
        }
    }

    function _LoadPrevPage(callback) {
        if (__CURRENT_PAGE != 1)
            gotoPage(__CURRENT_PAGE - 1, callback);
    }

    function _LoadNextPage(callback) {
        if (__CURRENT_PAGE != __TOTAL_PAGES)
            gotoPage(__CURRENT_PAGE + 1, callback);
    }

    function _LoadPage(callback, pageNo) {
        if ((pageNo > 0) && (pageNo <=__TOTAL_PAGES))
            gotoPage(pageNo, callback);
    }

    //PDF TOOLBAR

    function _DisplayDocumentToolbar (parent, groups) {
        if (document.getElementById("CreoViewDocumentToolbar") == null) {
            _buildToolbarCover(parent);
            var toolbarDiv = document.createElement("div");
            toolbarDiv.id = "CreoViewDocumentToolbar";
            toolbarDiv.setAttribute('style',"color: " + _uiColors.toolbar.text + "; background-color: " + _uiColors.toolbar.background + "; height: " + _toolbarHeight + "px; text-align: left; padding-top:1px; z-index: 1; -webkit-user-select: none; -ms-user-select: none; -moz-user-select: none;");
            _BuildDocumentToolbarContent(toolbarDiv, groups, parent);
            parent.insertBefore(toolbarDiv, parent.childNodes[0]);
            document.getElementById(_currentCanvasId).parentNode.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
            if (_sidebarEnabled) {
                var sidebarDiv = document.getElementById("CreoViewDocumentSidebar");
                if (sidebarDiv) {
                    sidebarDiv.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
                }
            }
        }
    }

    function _RemoveDocumentToolbar (parent) {
        var toolbarCover = document.getElementById("PdfToolbarCover");
        if (toolbarCover) {
            _toolbarGroupsLoaded.current = 0;
            parent.removeChild(toolbarCover);
        }
        var toolbarDiv = document.getElementById("CreoViewDocumentToolbar");
        if (toolbarDiv){
            parent.removeChild(toolbarDiv);
        }
        var currentCanvas = document.getElementById(_currentCanvasId);
        if (currentCanvas) {
            currentCanvas.parentNode.style.height = "100%";
        }
        if (_sidebarEnabled) {
            var sidebarDiv = document.getElementById("CreoViewDocumentSidebar");
            if (sidebarDiv) {
                sidebarDiv.style.height = "100%";
                sidebarDiv.childNodes[1].style.height = (parseInt(sidebarDiv.childNodes[1].style.height) + _toolbarHeight) + "px";
            }
        }
        if (_searchDrag.enabled){
            _searchDrag.enabled = false;
        }
        parent.removeEventListener("mousemove", function(e){
            _dragSearchBox(parent, e);
        });
        parent.removeEventListener("mouseleave", function(){
            if (_searchDrag.enabled) {
                _searchDrag.enabled = false;
            }
        });
        parent.removeEventListener("mouseup", function(){
            if (_searchDrag.enabled) {
                _searchDrag.enabled = false;
            }
        });
    }

    function _BuildDocumentToolbarContent (toolbarDiv, groups, parent) {
        _miniToolbar = false;
        while(toolbarDiv.firstChild){
            toolbarDiv.removeChild(toolbarDiv.firstChild);
        }

        var leftContainer = document.createElement("div");
        leftContainer.setAttribute('style',"float: left; height: 100%");
        var rightContainer = document.createElement("div");
        rightContainer.setAttribute('style',"float: right; height: 100%");
        var midContainer = document.createElement("div");
        midContainer.setAttribute('style',"height: " + _toolbarHeight + "px; overflow: hidden; white-space: nowrap");
        toolbarDiv.appendChild(leftContainer);
        toolbarDiv.appendChild(rightContainer);
        toolbarDiv.appendChild(midContainer);
        if (groups.sidebar) {
            leftContainer.appendChild(_buildNavbarGroup());
        }
        if (groups.pages) {
            var pagesGroup = _buildPagesGroup();
            leftContainer.appendChild(pagesGroup);
        }
        if (groups.rotate) {
            var rotateGroup = _buildRotateGroup();
            midContainer.appendChild(rotateGroup);
        }
        if (groups.zoom) {
            var zoomGroup = _buildZoomGroup();
            midContainer.appendChild(zoomGroup);
        }
        if (groups.cursor) {
            var cursorModeGroup = _buildCursorModeGroup();
            midContainer.appendChild(cursorModeGroup);
        }
        if (groups.search) {
            var searchGroup = _BuildDocumentSearchToolbar(parent);
            searchGroup.style.float = "right";
            searchGroup.className = "CreoToolbarGroup";
            rightContainer.appendChild(searchGroup);
        }
        if (groups.print) {
            var printGroup = _buildPrintGroup(parent);
            printGroup.style.float = "right";
            rightContainer.appendChild(printGroup);
        }
    }

    function _buildNavbarGroup() {
        var navbarGroup = _BuildDocumentToolbarButton('/icons/pdf_sidebar.svg', true);
        navbarGroup.id = "CreoToolbarSidebarGroup";
        navbarGroup.style.margin = "auto 5px";
        if(_sidebarEnabled){
            navbarGroup.style.backgroundColor = _uiColors.sidebar.background;
        }
        navbarGroup.addEventListener("click", function(e){
            e.stopPropagation();
            if(!_sidebarEnabled){
                navbarGroup.style.backgroundColor = _uiColors.toolbar.activeButton;
            } else {
                navbarGroup.style.backgroundColor = "inherit";
            }
            _togglePdfSidePane();
        });
        navbarGroup.addEventListener("mouseenter", function(){
            if(!_sidebarEnabled){
                navbarGroup.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        navbarGroup.addEventListener("mouseleave", function(){
            if(!_sidebarEnabled){
                navbarGroup.style.backgroundColor = "inherit";
            }
        });
        return navbarGroup;
    }

    function _buildPagesGroup() {
        var pagesGroup = document.createElement("div");
        pagesGroup.id = "CreoToolbarPagesGroup";
        pagesGroup.className = "CreoToolbarGroup";
        pagesGroup.setAttribute('style', "display: inline-block; margin-left: 15px; height: " + _toolbarHeight + "px");
        var firstPageButton = _BuildDocumentToolbarButton("/icons/pdf_first_page.svg", true);
        _AddToolbarButtonMouseOver(firstPageButton);
        firstPageButton.addEventListener("click", function(){
            _LoadPage(_pdfCallback, 1);
        });
        pagesGroup.appendChild(firstPageButton);
        var prevPageButton = _BuildDocumentToolbarButton("/icons/pdf_previous_page.svg", true);
        _AddToolbarButtonMouseOver(prevPageButton);
        prevPageButton.addEventListener("click", function(){
            _LoadPrevPage(_pdfCallback);
        });
        pagesGroup.appendChild(prevPageButton);

        var pageCounterSpan = _buildPagesCounter();
        pagesGroup.appendChild(pageCounterSpan);

        var nextPageButton = _BuildDocumentToolbarButton("/icons/pdf_next_page.svg", true);
        nextPageButton.id = "CreoToolbarPagesGroupNextPage";
        _AddToolbarButtonMouseOver(nextPageButton);
        nextPageButton.addEventListener("click", function(){
            _LoadNextPage(_pdfCallback);
        });
        pagesGroup.appendChild(nextPageButton);
        var lastPageButton = _BuildDocumentToolbarButton("/icons/pdf_last_page.svg", true);
        _AddToolbarButtonMouseOver(lastPageButton);
        lastPageButton.addEventListener("click", function(){
            _LoadPage(_pdfCallback, __TOTAL_PAGES);
        });
        pagesGroup.appendChild(lastPageButton);
        return pagesGroup;
    }

    function _buildRotateGroup () {
        var rotateGroup = document.createElement("div");
        rotateGroup.id = "CreoToolbarRotateGroup";
        rotateGroup.setAttribute('style', "display: inline-block; margin: auto 7px");
        rotateGroup.className = "CreoToolbarGroup";

        var rotateClockwiseButton = _BuildDocumentToolbarButton("/icons/pdf_rotate_clockwise.svg", true);
        rotateClockwiseButton.addEventListener("click", function(){
            _RotateDocumentPages(true);
        });
        _AddToolbarButtonMouseOver(rotateClockwiseButton);
        rotateGroup.appendChild(rotateClockwiseButton);

        var rotateAntiClockwiseButton = _BuildDocumentToolbarButton("/icons/pdf_rotate_anti_clockwise.svg", true);
        rotateAntiClockwiseButton.addEventListener("click", function(){
            _RotateDocumentPages(false);
        });
        _AddToolbarButtonMouseOver(rotateAntiClockwiseButton);
        rotateGroup.appendChild(rotateAntiClockwiseButton);

        return rotateGroup;
    }

    function _buildPagesCounter () {
        var pageCounterSpan = document.createElement("div");
        pageCounterSpan.id = "PageCounterSpan";
        pageCounterSpan.innerHTML = "  /  " + __TOTAL_PAGES;
        pageCounterSpan.setAttribute('style', "display: inline-block; position: absolute; margin: 10px");
        var pageCounterInput = document.createElement("input");
        pageCounterInput.id = "PageCounterInput";
        pageCounterInput.type = "text";
        pageCounterInput.pattern = "[0-9]+";
        pageCounterInput.size = "3";
        pageCounterInput.value = "1";
        pageCounterInput.addEventListener("keypress", function(e){
            if (!(e.key == "Enter" || /^\d*$/.test(e.key))) {
                e.preventDefault();
            }
        });
        pageCounterInput.addEventListener("change", function(e){
            var pageNo = parseInt(e.target.value);
            if (pageNo) {
                _LoadPage(_pdfCallback, pageNo);
            }
        });
        pageCounterSpan.insertBefore(pageCounterInput, pageCounterSpan.childNodes[0]);
        return pageCounterSpan;
    }

    function _buildZoomGroup () {
        var zoomGroup = document.createElement("div");
        zoomGroup.id = "CreoToolbarZoomGroup";
        zoomGroup.className = "CreoToolbarGroup";
        zoomGroup.setAttribute('style', "display: inline-block; margin: auto 7px;");
        var zoomInButton = _BuildDocumentToolbarButton("./icons/pdf_zoom_in.svg", true);
        _AddToolbarButtonMouseOver(zoomInButton);
        zoomInButton.addEventListener("click", function(){
            _zoomButtonScale = _zoomInScale;
            _zoomButtonPDF();
        });
        zoomGroup.appendChild(zoomInButton);
        var zoomOutButton = _BuildDocumentToolbarButton("./icons/pdf_zoom_out.svg", true);
        _AddToolbarButtonMouseOver(zoomOutButton);
        zoomOutButton.addEventListener("click", function(){
            _zoomButtonScale = _zoomOutScale;
            _zoomButtonPDF();
        });
        zoomGroup.appendChild(zoomOutButton);

        var pageModeSpan = document.createElement("span");
        pageModeSpan.setAttribute('style', "display: inline-block; position: relative; margin-left: 5px; margin-right: 5px; top: -3px");

        var pageModeInput = document.createElement("select");
        pageModeInput.id = "CreoViewDocToolbarPageModeSelect";
        var pageModeTexts = ["Original", "Fit Page", "Fit Width", "500%", "250%", "200%", "100%", "75%", "50%"];
        var pageModeValues = ["Original", "FitPage", "FitWidth", "500percent", "250percent", "200percent", "100percent", "75percent", "50percent"];
        for(var i=0; i < pageModeTexts.length; i++){
            var option = document.createElement("option");
            option.text = pageModeTexts[i];
            option.value = pageModeValues[i];
            pageModeInput.appendChild(option);
        }
        pageModeInput.value = _pageMode;
        pageModeInput.addEventListener("change", function(e){
            _pageMode = e.target.options[e.target.selectedIndex].value;
            _setPageModePDF();
        });

        pageModeSpan.appendChild(pageModeInput);
        zoomGroup.appendChild(pageModeSpan);
        return zoomGroup;
    }

    function _buildCursorModeGroup(){
        var cursorModeGroup = document.createElement("div");
        cursorModeGroup.id = "CreoToolbarCursorGroup";
        cursorModeGroup.className = "CreoToolbarGroup";
        cursorModeGroup.setAttribute('style', "display: inline-block; margin: auto 7px");

        var panModeButton = _BuildDocumentToolbarButton("/icons/pdf_pan_view.svg", true);
        panModeButton.addEventListener("mouseenter", function(){
            if (_cursor.current != _cursorTypes.pan) {
                panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        panModeButton.addEventListener("mouseleave", function(){
            if (_cursor.current != _cursorTypes.pan) {
                panModeButton.style.backgroundColor = "inherit";
            }
        });
        var textModeButton = _BuildDocumentToolbarButton("/icons/pdf_text_select.svg", true);
        textModeButton.addEventListener("mouseenter", function(){
            if (_cursor.current != _cursorTypes.text) {
                textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        textModeButton.addEventListener("mouseleave", function(){
            if (_cursor.current != _cursorTypes.text) {
                textModeButton.style.backgroundColor = "inherit";
            }
        });

        if (_cursor.current == _cursorTypes.pan) {
            panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
        } else if (_cursor.current == _cursorTypes.text) {
            textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
        }

        panModeButton.addEventListener("mousedown", function(e){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursor.current = _cursorTypes.pan;
            _setUserSelect();
            panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            textModeButton.style.backgroundColor = "inherit";
            if (_cursor.callback) {
                _cursor.callback(_cursorTypes.pan);
            }
        });
        cursorModeGroup.appendChild(panModeButton);

        textModeButton.addEventListener("mousedown", function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursor.current = _cursorTypes.text;
            _setUserSelect();
            textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            panModeButton.style.backgroundColor = "inherit";
            if (_cursor.callback) {
                _cursor.callback(_cursorTypes.text);
            }
        });
        cursorModeGroup.appendChild(textModeButton);

        return cursorModeGroup;
    }

    function _buildPrintGroup (parent) {
        var printGroup = document.createElement("div");
        printGroup.id = "CreoToolbarPrintGroup";
        printGroup.setAttribute('style', "display: inline-block; margin: auto 7px");
        printGroup.className = "CreoToolbarGroup";

        var printButton = _BuildDocumentToolbarButton("/icons/pdf_print.svg", true);
        printButton.addEventListener("click", function(){
            _PrintPdf(parent);
        });
        _AddToolbarButtonMouseOver(printButton);
        printGroup.appendChild(printButton);

        return printGroup;
    }

    function _resizeDocumentToolbar(parent, groups){
        var toolbarDiv = document.getElementById("CreoViewDocumentToolbar");
        document.getElementById(_currentCanvasId).parentNode.style.height = (parseInt(parent.clientHeight) - _toolbarHeight) + "px";
        if (_sidebarEnabled){
            var sidebarDiv = document.getElementById("CreoViewDocumentSidebar");
            if (sidebarDiv) {
                sidebarDiv.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
                sidebarDiv.childNodes[1].style.height = parseInt(parent.clientHeight) - (_toolbarHeight*2) + "px";
            }
        }
        if (!_miniToolbar) {
            var buttonsWidth = 0;
            var toolbarGroups = document.getElementsByClassName("CreoToolbarGroup");
            for (var i = 0; i < toolbarGroups.length; i++){
                buttonsWidth += parseInt(toolbarGroups[i].clientWidth) + 10;
            }
            _toolbarButtonsWidth = buttonsWidth + 282;
            if(parent.clientWidth <= _toolbarButtonsWidth){
                _toggleToolbarCover("block");
                _BuildDocumentToolbarMenu(toolbarDiv, groups, parent);
            }
        } else {
            if (parent.clientWidth > _toolbarButtonsWidth + 1){
                _toggleToolbarCover("block");
                _BuildDocumentToolbarContent(toolbarDiv, groups, parent);
                _updateDocumentToolbarPageDisplay();
            }
        }
        if (!_miniToolbar) {
            var midContainer = toolbarDiv.childNodes[2];
            midContainer.style.position = "absolute";
            midContainer.style.marginLeft = (parseInt(toolbarDiv.clientWidth) - (parseInt(midContainer.clientWidth) + 65))/2 + "px";
            midContainer.style.marginRight = (parseInt(toolbarDiv.clientWidth) - (parseInt(midContainer.clientWidth) + 65))/2 + "px";
            if(_toolbarGroups.pages) {
                var nextPageButton = document.getElementById("CreoToolbarPagesGroupNextPage");
                nextPageButton.style.marginLeft = (parseInt(document.getElementById("PageCounterSpan").clientWidth) + 20) + "px";
            }
        } else {
            var pageModeOptions = document.getElementById("PdfToolbarMiniMenuPageModeOptions");
            pageModeOptions.style.display = "none";
            pageModeOptions.parentNode.style.backgroundColor = "inherit";
            var midContainer = toolbarDiv.childNodes[2];
            midContainer.style.marginLeft = (parseInt(toolbarDiv.clientWidth) - 57)/2 + "px";
            var miniMenuDiv = document.getElementById("PdfToolbarMiniMenuButton").childNodes[1];
            miniMenuDiv.style.maxHeight = (parseInt(parent.clientHeight) - (_toolbarHeight + 15)) + "px";
            _toggleMenuScrollIndicator(miniMenuDiv, parent);
        }
    }

    function _updateDocumentToolbarPageDisplay() {
        if (_toolbarEnabled && !_miniToolbar && _toolbarGroups.pages){
            document.getElementById("PageCounterInput").value = __CURRENT_PAGE;
        }
    }

    function _BuildDocumentToolbarMenu(toolbarDiv, groups, parent){
        _miniToolbar = true;
        while(toolbarDiv.firstChild){
            toolbarDiv.removeChild(toolbarDiv.firstChild);
        }
        parent.removeEventListener("mousemove", function(e){
            _dragSearchBox(parent, e);
        });
        parent.removeEventListener("mouseleave", function(){
            if (_searchDrag.enabled) {
                _searchDrag.enabled = false;
            }
        });
        parent.removeEventListener("mouseup", function(){
            if (_searchDrag.enabled) {
                _searchDrag.enabled = false;
            }
        });

        var leftContainer = document.createElement("div");
        leftContainer.setAttribute('style',"float: left");
        var rightContainer = document.createElement("div");
        rightContainer.setAttribute('style',"float: right");
        var midContainer = document.createElement("div");
        midContainer.setAttribute('style',"margin-left: " + (parseInt(toolbarDiv.clientWidth) - 57)/2 + "px");
        toolbarDiv.appendChild(leftContainer);
        toolbarDiv.appendChild(rightContainer);
        toolbarDiv.appendChild(midContainer);

        var menuButton = document.createElement("span");
            menuButton.id = "PdfToolbarMiniMenuButton";
            var menuImage = document.createElement("img");
            _AddToolbarButtonLoad(menuImage);
            menuImage.src = ThingView.resourcePath + '/icons/pdf_more_menu.svg';
            menuButton.appendChild(menuImage);
            menuButton.setAttribute('style', "position: absolute; margin: 6px; padding: 6px; -webkit-user-select: none; -ms-user-select: none; -moz-user-select: none; cursor: pointer");
            var menuDiv = document.createElement("div");
            menuDiv.id = "PdfToolbarMiniMenuDiv";
            menuDiv.setAttribute('style', "display: none; background-color: " + _uiColors.toolbar.menuButton + "; position: absolute; z-index: 5; padding: 5px; margin-top: 12.5px; margin-left: -6px; cursor: auto; color: " + _uiColors.toolbar.text + "; white-space: nowrap; max-height: " + (parseInt(parent.clientHeight) - (_toolbarHeight + 15)) + "px; overflow-y: auto; overflow-x: visible; scrollbar-width: none; -ms-overflow-style: none");
            var newStyle = "#PdfToolbarMiniMenuDiv::-webkit-scrollbar {display: none}";
            if (document.querySelector('style') &&
                document.querySelector('style').textContent.search(newStyle) == -1) {
                document.querySelector('style').textContent += newStyle;
            } else if (!document.querySelector('style')) {
                var style = document.createElement('style');
                style.textContent = newStyle;
                document.getElementsByTagName('head')[0].appendChild(style);
            }
            if (groups.sidebar) {
                _buildMiniSidebarGroup(menuDiv);
            }
            if (groups.pages) {
                _buildMiniPagesGroup(menuDiv);
                var pagesCounter = _buildPagesCounter();
                pagesCounter.style.marginLeft = "42px";
                leftContainer.appendChild(pagesCounter);
            }
            if (groups.rotate) {
                _buildMiniRotateGroup(menuDiv);
            }
            if (groups.zoom) {
                _buildMiniZoomGroup(menuDiv);
                var zoomGroup = document.createElement("div");
                zoomGroup.setAttribute('style', "display: inline-block; white-space: nowrap");
                var zoomInButton = _BuildDocumentToolbarButton("/icons/pdf_zoom_in.svg", true);
                _AddToolbarButtonMouseOver(zoomInButton);
                zoomInButton.addEventListener("click", function(){
                    _zoomButtonScale = _zoomInScale;
                    _zoomButtonPDF();
                });
                zoomGroup.appendChild(zoomInButton);
                var zoomOutButton = _BuildDocumentToolbarButton("/icons/pdf_zoom_out.svg", true);
                _AddToolbarButtonMouseOver(zoomOutButton);
                zoomOutButton.addEventListener("click", function(){
                    _zoomButtonScale = _zoomOutScale;
                    _zoomButtonPDF();
                });
                zoomGroup.appendChild(zoomOutButton);
                midContainer.appendChild(zoomGroup);
            }
            if (groups.cursor) {
                _buildMiniCursorGroup(menuDiv);
            }
            if (groups.print && _printEnabled) {
                _buildMiniPrintGroup(parent, menuDiv);
            }

            menuDiv.addEventListener("scroll", function(){
                _toggleMenuScrollIndicator(menuDiv);
            });

            menuButton.appendChild(menuDiv);
            menuButton.addEventListener("click", function(){
                if(menuDiv.style.display == "none"){
                    menuDiv.style.display = "block";
                    menuButton.style.backgroundColor = _uiColors.toolbar.activeButton;
                    _toggleMenuScrollIndicator(menuDiv, parent);
                } else {
                    menuDiv.style.display = "none";
                    menuButton.style.backgroundColor = "inherit";
                }
            });
            menuButton.addEventListener("mouseenter", function(){
                if (menuDiv.style.display == "none") {
                    menuButton.style.backgroundColor = _uiColors.toolbar.activeButton;
                }
            });
            menuButton.addEventListener("mouseleave", function(){
                if (menuDiv.style.display == "none") {
                    menuButton.style.backgroundColor = "inherit";
                }
            });

        if (groups.search) {
            var searchButton = _BuildDocumentSearchToolbar(parent);
            rightContainer.appendChild(searchButton);
        }
        leftContainer.appendChild(menuButton);
    }

    function _buildMenuHr () {
        var hr = document.createElement("hr");
        hr.setAttribute('style', "margin-top: 4px; margin-bottom: 4px; color: " + _uiColors.toolbar.background + "; border-style: solid");
        return hr;
    }

    function _buildMiniPagesGroup (menuDiv) {
        var firstPageDiv = _createMiniMenuItem("First Page", "/icons/pdf_first_page.svg");
        firstPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _LoadPage(_pdfCallback, 1);
        });
        _AddMiniToolbarEvents(firstPageDiv);
        menuDiv.appendChild(firstPageDiv);

        var prevPageDiv = _createMiniMenuItem("Previous Page", "/icons/pdf_previous_page.svg");
        prevPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _LoadPrevPage(_pdfCallback);
        });
        _AddMiniToolbarEvents(prevPageDiv);
        menuDiv.appendChild(prevPageDiv);

        var nextPageDiv = _createMiniMenuItem("Next Page", "/icons/pdf_next_page.svg");
        nextPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _LoadNextPage(_pdfCallback);
        });
        _AddMiniToolbarEvents(nextPageDiv);
        menuDiv.appendChild(nextPageDiv);

        var lastPageDiv = _createMiniMenuItem("Last Page", "/icons/pdf_last_page.svg");
        lastPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _LoadPage(_pdfCallback, __TOTAL_PAGES);
        });
        _AddMiniToolbarEvents(lastPageDiv);
        menuDiv.appendChild(lastPageDiv);

        menuDiv.appendChild(_buildMenuHr());
    }

    function _buildMiniRotateGroup (menuDiv) {
        var rotateClockwiseDiv = _createMiniMenuItem("Rotate Clockwise", "/icons/pdf_rotate_clockwise.svg");
        rotateClockwiseDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _RotateDocumentPages(true);
        });
        _AddMiniToolbarEvents(rotateClockwiseDiv);
        menuDiv.appendChild(rotateClockwiseDiv);

        var rotateAntiClockwiseDiv = _createMiniMenuItem("Rotate Anti-clockwise", "/icons/pdf_rotate_anti_clockwise.svg");
        rotateAntiClockwiseDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _RotateDocumentPages(false);
        });
        _AddMiniToolbarEvents(rotateAntiClockwiseDiv);
        menuDiv.appendChild(rotateAntiClockwiseDiv);
        menuDiv.appendChild(_buildMenuHr());
    }

    function _buildMiniZoomGroup (menuDiv) {
        var zoomInDiv = _createMiniMenuItem("Zoom In", "/icons/pdf_zoom_in.svg");
        zoomInDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _zoomButtonScale = _zoomInScale;
            _zoomButtonPDF();
        });
        _AddMiniToolbarEvents(zoomInDiv);
        menuDiv.appendChild(zoomInDiv);

        var zoomOutDiv = _createMiniMenuItem("Zoom Out", "/icons/pdf_zoom_out.svg");
        zoomOutDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _zoomButtonScale = _zoomOutScale;
            _zoomButtonPDF();
        });
        _AddMiniToolbarEvents(zoomOutDiv);
        menuDiv.appendChild(zoomOutDiv);

        menuDiv.appendChild(_buildMenuHr());

        var pageModeOptionsDiv = document.createElement("div");
        pageModeOptionsDiv.id = "PdfToolbarMiniMenuPageModeOptions";
        pageModeOptionsDiv.setAttribute('style', "display: none; position: fixed; background-color: " + _uiColors.toolbar.menuButton + "; padding: 2px auto; overflow-y: scroll; scrollbar-width: none; -ms-overflow-style: none");
        var newStyle = "#PdfToolbarMiniMenuPageModeOptions::-webkit-scrollbar {display: none}";
        if (document.querySelector('style') &&
            document.querySelector('style').textContent.search(newStyle) == -1) {
            document.querySelector('style').textContent += newStyle;
        } else if (!document.querySelector('style')) {
            var style = document.createElement('style');
            style.textContent = newStyle;
            document.getElementsByTagName('head')[0].appendChild(style);
        }
        var pageModeButton = _createMiniMenuItem("Page Mode", null);
        var pageModeArrow = document.createElement("img");
        pageModeArrow.src = ThingView.resourcePath + "/icons/pdf_next_find.svg";
        pageModeArrow.setAttribute('style', "transform: rotate(90deg); float: right; overflow: visible");
        pageModeButton.appendChild(pageModeArrow);
        pageModeButton.addEventListener("click", function(e){
            e.stopPropagation();
            if (pageModeOptionsDiv.style.display == "none") {
                pageModeOptionsDiv.style.left = (parseInt(pageModeButton.getBoundingClientRect().right) + 5) + "px";
                pageModeOptionsDiv.style.top = (parseInt(pageModeButton.getBoundingClientRect().top) + 1) + "px";
                pageModeOptionsDiv.style.maxHeight = (menuDiv.clientHeight - (pageModeButton.getBoundingClientRect().top - menuDiv.getBoundingClientRect().top) - 1) + "px";
                pageModeOptionsDiv.style.display = "block";
                pageModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            } else {
                pageModeOptionsDiv.style.display = "none";
                pageModeButton.style.backgroundColor = "inherit";
            }
        });
        pageModeButton.addEventListener("mouseenter", function(){
            if (pageModeOptionsDiv.style.display == "none") {
                pageModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        pageModeButton.addEventListener("mouseleave", function(){
            if (pageModeOptionsDiv.style.display == "none") {
                pageModeButton.style.backgroundColor = "inherit";
            }
        });
        pageModeButton.appendChild(pageModeOptionsDiv);
        menuDiv.appendChild(pageModeButton);

        var pageModeTexts = ["Original", "Fit Page", "Fit Width", "500%", "250%", "200%", "100%", "75%", "50%"];
        for (var i = 0; i < pageModeTexts.length; i++) {
            var optionDiv = document.createElement("div");
            optionDiv.setAttribute('style', "white-space: nowrap; padding: 2px 5px");
            optionDiv.textContent = pageModeTexts[i];
            optionDiv.addEventListener("click", function(e){
                e.stopPropagation();
                var processedPageMode = e.target.innerHTML.replace(" ", "").replace("%", "percent");
                _pageMode = processedPageMode;
                _setPageModePDF();
                for (var j = 0; j < e.target.parentNode.childNodes.length; j++) {
                    e.target.parentNode.childNodes[j].style.backgroundColor = "inherit";
                }
                e.target.style.backgroundColor = _uiColors.toolbar.activeButton;
            });
            optionDiv.addEventListener("mouseenter", function(e){
                e.target.style.backgroundColor = _uiColors.toolbar.activeButton;
            });
            optionDiv.addEventListener("mouseleave", function(e){
                var processedPageMode = e.target.innerHTML.replace(" ", "").replace("%", "percent");
                if (_pageMode != processedPageMode) {
                    e.target.style.backgroundColor = "inherit";
                }
            });
            pageModeOptionsDiv.appendChild(optionDiv);
        }
        menuDiv.appendChild(_buildMenuHr());
    }

    function _buildMiniCursorGroup (menuDiv) {
        var panModeButton = _createMiniMenuItem("Pan Mode", "/icons/pdf_pan_view.svg");
        menuDiv.appendChild(panModeButton);
        var textModeButton = _createMiniMenuItem("Text Select Mode", "/icons/pdf_text_select.svg");
        menuDiv.appendChild(textModeButton);
        if (_cursor.current == _cursorTypes.pan) {
            panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
        } else if (_cursor.current == _cursorTypes.text) {
            textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
        }

        panModeButton.addEventListener("click", function(e){
            e.stopPropagation();
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursor.current = _cursorTypes.pan;
            _setUserSelect();
            panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            textModeButton.style.backgroundColor = "inherit";
            if (_cursor.callback) {
                _cursor.callback(_cursorTypes.pan);
            }
        });
        textModeButton.addEventListener("click", function(e){
            e.stopPropagation();
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursor.current = _cursorTypes.text;
            _setUserSelect();
            textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            panModeButton.style.backgroundColor = "inherit";
            if (_cursor.callback) {
                _cursor.callback(_cursorTypes.text);
            }
        });

        panModeButton.addEventListener("mouseenter", function(){
            if (_cursor.current != _cursorTypes.pan) {
                panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        panModeButton.addEventListener("mouseleave", function(){
            if (_cursor.current != _cursorTypes.pan) {
                panModeButton.style.backgroundColor = "inherit";
            }
        });
        textModeButton.addEventListener("mouseenter", function(){
            if (_cursor.current != _cursorTypes.text) {
                textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        textModeButton.addEventListener("mouseleave", function(){
            if (_cursor.current != _cursorTypes.text) {
                textModeButton.style.backgroundColor = "inherit";
            }
        });

        menuDiv.appendChild(_buildMenuHr());
    }

    function _buildMiniSidebarGroup (menuDiv) {
        var sidebarToggleDiv = _createMiniMenuItem("Display Sidebar", "/icons/pdf_sidebar.svg");
        if (_sidebarEnabled){
            sidebarToggleDiv.style.backgroundColor = _uiColors.toolbar.activeButton;
        }
        sidebarToggleDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _togglePdfSidePane();
            if (_sidebarEnabled){
                sidebarToggleDiv.style.backgroundColor = _uiColors.toolbar.activeButton;
            } else {
                sidebarToggleDiv.style.backgroundColor = "inherit";
            }
        });
        sidebarToggleDiv.addEventListener("mouseenter", function(){
            if(!_sidebarEnabled){
                sidebarToggleDiv.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        sidebarToggleDiv.addEventListener("mouseleave", function(){
            if(!_sidebarEnabled){
                sidebarToggleDiv.style.backgroundColor = "inherit";
            }
        });
        menuDiv.appendChild(sidebarToggleDiv);
        menuDiv.appendChild(_buildMenuHr());
    }

    function _buildMiniPrintGroup (parent, menuDiv) {
        var printDiv = _createMiniMenuItem("Print PDF", "/icons/pdf_print.svg");
        _AddMiniToolbarEvents(printDiv);
        printDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _PrintPdf(parent);
        });
        menuDiv.appendChild(printDiv);
    }

    function _createMiniMenuItem (text, imgURL) {
        var item = document.createElement("div");
        item.setAttribute('style', "background-color: " + _uiColors.toolbar.menuButton + "; color: " + _uiColors.toolbar.text + "; cursor: pointer; height: 23px; padding-right: 10px; padding-top: 7px");
        item.textContent = text;
        if (imgURL) {
            var itemIcon = document.createElement("img");
            itemIcon.src = ThingView.resourcePath + imgURL;
            itemIcon.setAttribute('style', "margin: 0px 18px 0px 12px");
            item.insertBefore(itemIcon, item.childNodes[0]);
        } else {
            item.style.paddingLeft = "46px";
        }
        return item;
    }

    function _AddMiniToolbarEvents (button) {
        button.addEventListener("mouseenter", function(){
            button.style.backgroundColor = _uiColors.toolbar.activeButton;
        });
        button.addEventListener("mouseleave", function(){
            button.style.backgroundColor = "inherit";
        });
    }

    function _setDocumentMenuUnderline (target) {
        if (_toolbarEnabled && _miniToolbar) {
            var options = target.parentNode.childNodes;
            for (var i = 0; i < options.length; i++) {
                options[i].style.textDecoration = "none";
            }
            target.style.textDecoration = "underline";
        }
    }

    function _BuildDocumentSearchToolbar (parent) {
        var searchButton = document.createElement("div");
            searchButton.id = "CreoToolbarSearchGroup";
            searchButton.setAttribute('style', "display: inline-block; margin: 6px; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none");
            var searchIcon = document.createElement("img");
            _AddToolbarButtonLoad(searchIcon);
            searchIcon.alt = 'Search...';
            searchIcon.src = ThingView.resourcePath + '/icons/pdf_find.svg';
            searchButton.style.padding = "5px";
            searchButton.appendChild(searchIcon);
            searchButton.style.cursor = "pointer";

            var searchGroup = document.createElement("div");
            searchGroup.setAttribute('style', "display: none; color: " + _uiColors.toolbar.text + "; background-color: " + _uiColors.toolbar.background + "; position: absolute; z-index: 4; padding: 0px 5px 5px; margin-top: 7.5px; top: 80px; right: 30px; cursor: move");
            searchGroup.id = "PdfToolbarSearchBox";
            _searchDrag.y = 80;
            _searchDrag.x = _toolbarHeight;

            var searchTextWrapper = document.createElement("span");
            searchTextWrapper.setAttribute('style', "margin-right: 2px; margin-top: 5px; display: inline-block; vertical-align: middle");

            var searchTextBox = document.createElement("input");
            searchTextBox.id = "PdfToolbarSearchTextBox";
            searchTextBox.type = _cursorTypes.text;
            searchTextBox.setAttribute('style', "cursor: auto");
            searchTextBox.addEventListener("click", function(e){
                e.stopPropagation();
            });
            searchTextBox.addEventListener("mousedown", function(e){
                e.stopPropagation();
            });
            searchTextBox.addEventListener("keydown", function(e){
                if (e.key == "Enter") {
                    if (_searchTerm != searchTextBox.value) {
                        _SearchInPdfDocument(searchTextBox.value);
                    } else {
                        if (_searchState) {
                            _searchState.highlightAll = false;
                            _searchState.findPrevious = false;
                            _nextMatch();
                        }
                    }
                }
            });
            searchTextWrapper.appendChild(searchTextBox);
            searchGroup.appendChild(searchTextWrapper);

            var searchQueryButton =_BuildDocumentToolbarButton('/icons/pdf_find.svg', false);
            searchQueryButton.style.verticalAlign = "middle";
            searchQueryButton.title = "Search";
            _AddToolbarButtonMouseOver(searchQueryButton);
            searchQueryButton.addEventListener("click", function(e){
                e.stopPropagation();
                _SearchInPdfDocument(searchTextBox.value);
            });
            searchGroup.appendChild(searchQueryButton);

            var searchClearButton = _BuildDocumentToolbarButton('/icons/pdf_clear.svg', false);
            searchClearButton.style.backgroundColor = "transparent";
            searchClearButton.style.verticalAlign = "middle";
            searchClearButton.style.position = "absolute";
            searchClearButton.style.float = "right";
            searchClearButton.style.margin = "-1px 0px auto -20px";
            searchClearButton.title = "Clear";
            searchClearButton.addEventListener("click", function(e){
                e.stopPropagation();
                _searchTerm = "";
                searchTextBox.value = "";
                _removePdfSearchResultHighlights ();
                _DisplayPdfSearchResultsDialogue(_searchStatusMessage.enterTerm);
            });
            searchTextWrapper.appendChild(searchClearButton);

            var searchNextButton = _BuildDocumentToolbarButton('/icons/pdf_previous_find.svg', false);
            searchNextButton.style.verticalAlign = "middle";
            searchNextButton.title = "Next";
            _AddToolbarButtonMouseOver(searchNextButton);
            searchNextButton.addEventListener("click", function(e){
                e.stopPropagation();
                if (_searchState) {
                    _searchState.highlightAll = false;
                    _searchState.findPrevious = false;
                    _nextMatch();
                }
            });
            searchGroup.appendChild(searchNextButton);

            var searchPrevButton = _BuildDocumentToolbarButton('/icons/pdf_next_find.svg', false);
            searchPrevButton.style.verticalAlign = "middle";
            searchPrevButton.title = "Previous";
            _AddToolbarButtonMouseOver(searchPrevButton);
            searchPrevButton.addEventListener("click", function(e){
                e.stopPropagation();
                if (_searchState) {
                    _searchState.highlightAll = false;
                    _searchState.findPrevious = true;
                    _nextMatch();
                }
            });
            searchGroup.appendChild(searchPrevButton);

            var searchCloseButton = _BuildDocumentToolbarButton('/icons/pdf_close.svg', false);
            searchCloseButton.style.margin = "0px 0px -20px 12px";
            searchCloseButton.style.padding = "0px";
            searchCloseButton.title = "Close";
            _AddToolbarButtonMouseOver(searchCloseButton);
            searchCloseButton.addEventListener("click", function(e){
                e.stopPropagation();
                searchGroup.style.display = "none";
                searchButton.style.backgroundColor = "inherit";
                searchButton.style.color = "inherit";
                _searchTerm = "";
                _removePdfSearchResultHighlights ();
            });
            searchGroup.appendChild(searchCloseButton);

            var searchResultsDiv = document.createElement("div");
            searchResultsDiv.id = "PdfToolbarSearchResultsDiv";
            searchResultsDiv.setAttribute('style', "text-align: center; margin-top: 1px");
            searchResultsDiv.textContent = _searchStatusMessage.enterTerm;
            searchGroup.appendChild(searchResultsDiv);

            searchButton.appendChild(searchGroup);

            searchButton.addEventListener("click", function(e){
                e.stopPropagation();
                _toggleSearchBox();
            });
            searchGroup.addEventListener("click", function(e){
                e.stopPropagation();
            });
            searchGroup.addEventListener("mousedown", function(e){
                if (!_searchDrag.enabled) {
                    _searchDrag.enabled = true;
                    _searchDrag.x = e.clientX;
                    _searchDrag.y = e.clientY;
                }
            });
            parent.addEventListener("mousemove", function(e){
                _dragSearchBox(parent, e);
            });
            parent.addEventListener("mouseleave", function(){
                if (_searchDrag.enabled) {
                    _searchDrag.enabled = false;
                }
            });
            parent.addEventListener("mouseup", function(){
                if (_searchDrag.enabled) {
                    _searchDrag.enabled = false;
                }
            });
            searchButton.addEventListener("mouseenter", function(){
                if (searchGroup.style.display == "none") {
                    searchButton.style.backgroundColor = _uiColors.toolbar.activeButton;
                }
            });
            searchButton.addEventListener("mouseleave", function(){
                if (searchGroup.style.display == "none") {
                    searchButton.style.backgroundColor = "inherit";
                }
            });

        return searchButton;
    }

    function _toggleSearchBox () {
        if (!_IsPDFSession() || !_toolbarEnabled || !_toolbarGroups.search) {
            return;
        }
        _searchDrag.enabled = false;
        var searchGroup = document.getElementById("PdfToolbarSearchBox");
        var searchButton = document.getElementById("CreoToolbarSearchGroup");
        if(searchGroup.style.display == "none"){
            searchGroup.style.display = "block";
            document.getElementById("PdfToolbarSearchTextBox").value = "";
            _DisplayPdfSearchResultsDialogue(_searchStatusMessage.enterTerm);
            searchButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            searchButton.style.color = _uiColors.toolbar.activeText;
        } else {
            searchGroup.style.display = "none";
            searchButton.style.backgroundColor = "inherit";
            searchButton.style.color = "inherit";
        }
    }

    function _dragSearchBox (parent, e) {
        if (_searchDrag.enabled) {
            var parentRect = parent.getBoundingClientRect();
            var searchBox = document.getElementById("PdfToolbarSearchBox");
            var searchRect = searchBox.getBoundingClientRect();
            if (!(parentRect.left > searchRect.left - (_searchDrag.x - e.clientX) ||
                parentRect.right - 20 < searchRect.right - (_searchDrag.x - e.clientX) ||
                parentRect.top + 35 > searchRect.top - (_searchDrag.y - e.clientY) ||
                parentRect.bottom - 20 < searchRect.bottom - (_searchDrag.y - e.clientY))) {
                    searchBox.style.right = (parseInt(searchBox.style.right) + (_searchDrag.x - e.clientX)) + "px";
                    searchBox.style.top = (parseInt(searchBox.style.top) - (_searchDrag.y - e.clientY)) + "px";
            }
            _searchDrag.x = e.clientX;
            _searchDrag.y = e.clientY;
        }
    }

    function _toggleMenuScrollIndicator(menuDiv, parent) {
        if (!document.getElementById("PdfToolbarMiniMenuScrollIndicator") &&
            menuDiv.scrollTop != (menuDiv.scrollHeight - menuDiv.offsetHeight)) {
            var scrollIndicator = document.createElement("div");
            scrollIndicator.id = "PdfToolbarMiniMenuScrollIndicator";
            scrollIndicator.setAttribute('style', "background-color: " + _uiColors.toolbar.menuButton + "; box-shadow: 0px -7px 6px 0px " + _uiColors.toolbar.menuButton + "; width: " + (parseInt(menuDiv.clientWidth) - 10) + "px; height: 20px; position: fixed; bottom: " + (window.innerHeight - parseInt(menuDiv.getBoundingClientRect().bottom)) + "px; left: " + (parseInt(menuDiv.getBoundingClientRect().left) + 5) + "px");
            var scrollArrow = document.createElement("img");
            scrollArrow.src = ThingView.resourcePath + "icons/pdf_previous_find.svg";
            scrollArrow.setAttribute('style', "left: " + (parseInt(scrollIndicator.style.width) / 2 - 8) + "px; top: 2px; position: absolute");
            scrollIndicator.appendChild(scrollArrow);
            menuDiv.appendChild(scrollIndicator);
        } else if (document.getElementById("PdfToolbarMiniMenuScrollIndicator") && (menuDiv.scrollTop == (menuDiv.scrollHeight - menuDiv.offsetHeight))) {
            menuDiv.removeChild(document.getElementById("PdfToolbarMiniMenuScrollIndicator"));
        }
    }

    function _buildToolbarCover (parent) {
        var toolbarCover = document.createElement('div');
        toolbarCover.id = "PdfToolbarCover";
        toolbarCover.setAttribute('style', "display: block; z-index: 4; background-color: " + _uiColors.toolbar.background + "; width:" + parseInt(parent.clientWidth) + "px; height: " + _toolbarHeight + "px; position: fixed; top: " + (parseInt(parent.getBoundingClientRect().top) + 2) + "px");
        parent.appendChild(toolbarCover);
    }

    function _toggleToolbarCover (state) {
        if (!state) {
            return;
        }
        if (state == "none") {
            _toolbarGroupsLoaded.current += 1;
            if (_toolbarGroupsLoaded.targetFull == 0 ||
               (!_miniToolbar && _toolbarGroupsLoaded.current == _toolbarGroupsLoaded.targetFull) ||
               (_miniToolbar && _toolbarGroupsLoaded.current == _toolbarGroupsLoaded.targetMini)) {
                    document.getElementById("PdfToolbarCover").style.display = state;
            }
        } else if (state == "block"){
            _toolbarGroupsLoaded.current = 0;
             document.getElementById("PdfToolbarCover").style.display = state;
        }
    }

    //PDF BOOKMARKS

    function _ShowPdfBookmark (bookmarkTitle) {
        var bookmarkData = _GetPdfBookmark(bookmarkTitle, _bookmarks);
        if(!bookmarkData){
            return;
        }
        __PDF_DOC.getDestination(bookmarkData.dest).then(function(val){
            var destination = val ? val : bookmarkData.dest;
            __PDF_DOC.getPageIndex(destination[0]).then(function(pageIndex){
                if(destination[1].name == "FitB") {
                    _pageMode = "FitPage";
                    _setPageModeFitPage(function() {
                        _LoadPage(function(success){
                            if (_pdfCallback) {
                                _pdfCallback(success);
                            }
                        }, pageIndex+1);
                    });
                } else {
                    if (destination[1].name == "XYZ" && !_checkPageRotation()) {
                        gotoBookmark(pageIndex+1, destination, function(success) {
                            if (_pdfCallback) {
                                _pdfCallback(success);
                            }
                        });
                    } else {
                        _LoadPage(function(success){
                            if (_pdfCallback) {
                                _pdfCallback(success);
                            }
                        }, pageIndex+1);
                    }
                }
            });
        });
    }

    function _setPageModeFitPage(callback) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var scale = (canvasWrapper.parentNode.clientHeight - _marginSize * 2) / _getLargestPageHeight() * __ZOOMSCALE;
        if (Math.abs(__ZOOMSCALE - scale) > 0.001) {
            __ZOOMSCALE = scale;

            _refreshPDF(function(success){
                if (success) {
                    callback();
                }
            }, {zoomScale: __ZOOMSCALE});
        } else {
            callback();
        }

        _updateToolbarPageModeSelection();
    }

    function _GetPdfBookmark(bookmarkTitle, bookmarkList) {
        var returnBookmark = null;
        for(var i = 0; i < bookmarkList.length; i++) {
            if (bookmarkList[i].title == bookmarkTitle) {
                returnBookmark = bookmarkList[i];
            } else if (bookmarkList[i].items.length > 0){
                returnBookmark = _GetPdfBookmark(bookmarkTitle, bookmarkList[i].items);
            }
            if (returnBookmark){
                break;
            }
        }
        return returnBookmark;
    }

    //PDF SEARCH

    function _resetSearchVariables() {
        _extractTextPromises = [];
        _pageMatches = [];
        _pageContents = [];
        _matchesCountTotal = 0;
        _indexedPageNum = 0;
        clearTimeout(_findTimeout);
        _findTimeout = null;
        _pendingFindMatches = Object.create(null);
        _scrollMatches = false;
        _searchState = null;
        _dirtyMatch = false;
        _selected = {
            pageIdx: -1,
            matchIdx: -1
        };
        _offset = {
            pageIdx: null,
            matchIdx: null,
            wrapped: false
        };
        _resumePageIdx = null;
        _matchSelected = {
            pageIdx:  -1,
            matchIdx: -1
        };
        _pagesToSearch = null;
    }

    function _SearchInPdfDocument(searchTerm, findDirection, callback) {
        if(searchTerm == ""){
            return;
        }

        if (callback) {
            _pdfSearchCallback = callback;
        }

        if (_pdfSearchCallback) {
            if (_searchTerm == searchTerm &&
                _searchResultsCase == _searchCaseMatch &&
                _searchResultsWord == _searchWordMatch) {
                _pdfSearchCallback(true, _matchesCountTotal != 0); // duplicated search
                return;
            }
        }

        _removePdfSearchResultHighlights();
        _searchTerm = searchTerm;
        _searchResultsCase = _searchCaseMatch;
        _searchResultsWord = _searchWordMatch;

        _DisplayPdfSearchResultsDialogue(_searchStatusMessage.searching);

        _searchState = {
            query: _searchTerm,
            phraseSearch: true,
            caseSensitive: _searchCaseMatch,
            entireWord: _searchWordMatch,
            highlightAll: (findDirection == 0),
            findPrevious: (findDirection == -1)
        };
        _dirtyMatch = true;

        _buildSearchResult();
    }

    function _updateUIResultsCount() {
        if (!_toolbarEnabled) return;

        var total = _matchesCountTotal;
        var pageIdx = _selected.pageIdx;
        var matchIdx = _selected.matchIdx;
        var current = 0;
        if (matchIdx !== -1) {
            for (var i = 0; i < pageIdx; i++) {
                current += _pageMatches[i] && _pageMatches[i].length || 0;
            }

            current += matchIdx + 1;
        }

        if (current < 1 || current > total) {
            current = total = 0;
        }

        var message = "";
        if (_indexedPageNum != __TOTAL_PAGES) {
            message = "Searching page " + _indexedPageNum;
        } else {
            if (total == 0) {
                message = _searchStatusMessage.notFound;
            } else {
                message = current + " of " + total + " match" + (total != 1 ? "es" : "");
            }
        }
        _DisplayPdfSearchResultsDialogue(message);
    }

    function _createPromise() {
        var capability = {};
        capability.promise = new Promise(function (resolve, reject) {
            capability.resolve = resolve;
            capability.reject = reject;
        });
        return capability;
    }

    function _extractText() {
        if (_extractTextPromises.length > 0) {
            return;
        }

        var promise = Promise.resolve();

        var _loop = function _loop(pageNo) {
            var extractTextCapability = _createPromise();
            _extractTextPromises[pageNo] = extractTextCapability.promise;
            promise = promise.then(function () {
                return __PDF_DOC.getPage(pageNo).then(function (pdfPage) {
                    return pdfPage.getTextContent({
                        normalizeWhitespace: true
                    });
                }).then(function (textContent) {
                    var textItems = textContent.items;
                    var strBuf = [];

                    for (var j = 0, jj = textItems.length; j < jj; j++) {
                        strBuf.push(textItems[j].str);
                    }

                    _pageContents[pageNo] = normalize(strBuf.join(''));
                    extractTextCapability.resolve(pageNo);
                }, function (reason) {
                    console.error("Unable to get text content for page ".concat(pageNo), reason);
                    _pageContents[pageNo] = '';
                    extractTextCapability.resolve(pageNo);
                });
            });
        };

        var curPage = _searchState.highlightAll ? _firstLoadedPage : __CURRENT_PAGE;
        var count = 0;
        while (count != __TOTAL_PAGES) {
            _loop(curPage);
            curPage = _getNextPageNo(curPage, !_searchState.findPrevious);
            count += 1;
        }
    }

    function _getNextPageNo(pageNo, next) {
        if (next) {
            var nextPageNo = pageNo + 1;
            if (nextPageNo > __TOTAL_PAGES) {
                return 1;
            } else {
                return nextPageNo;
            }
        } else {
            var prevPageNo = pageNo - 1;
            if (prevPageNo < 1) {
                return __TOTAL_PAGES;
            } else {
                return prevPageNo;
            }
        }
    }

    function _calculatePageMatch(pageNo) {
        var pageContent = _pageContents[pageNo];
        var query = _searchTerm;

        if (!_searchCaseMatch) {
            pageContent = pageContent.toLowerCase();
            query = query.toLowerCase();
        }

        _calculatePhraseMatch(query, pageNo, pageContent, _searchWordMatch);

        if (_resumePageIdx === pageNo) {
            _resumePageIdx = null;

            _nextPageMatch();
        }

        var pageMatchesCount = _pageMatches[pageNo].length;

        if (pageMatchesCount > 0) {
            _matchesCountTotal += pageMatchesCount;
        }
        _indexedPageNum += 1;
        if (_indexedPageNum == __TOTAL_PAGES) {
            if (_pdfSearchCallback) {
                _pdfSearchCallback(false, _matchesCountTotal != 0); // new search
            }
        }
        _updateUIResultsCount();
    }

    function _calculatePhraseMatch(query, pageIndex, pageContent, entireWord) {
        var matches = [];
        var queryLen = query.length;
        var matchIdx = -queryLen;

        while (true) {
            matchIdx = pageContent.indexOf(query, matchIdx + queryLen);

            if (matchIdx === -1) {
                break;
            }

            if (entireWord && !_isEntireWord(pageContent, matchIdx, queryLen)) {
                continue;
            }

            matches.push(matchIdx);
        }

        _pageMatches[pageIndex] = matches;
    }

    function _nextMatch() {
        var previous = _searchState.findPrevious;
        var numPages = __TOTAL_PAGES;

        if (_dirtyMatch) {
            _dirtyMatch = false;
            _selected.pageIdx = _selected.matchIdx = -1;
            _offset.pageIdx = __CURRENT_PAGE;
            _offset.matchIdx = null;
            _offset.wrapped = false;
            _resumePageIdx = null;
            _pageMatches.length = 0;
            _matchesCountTotal = 0;
            _indexedPageNum = 0;

            var _calLoop = function _calLoop(curPage) {
                if (_pendingFindMatches[curPage] == true) {
                    return;
                }

                _pendingFindMatches[curPage] = true;

                _extractTextPromises[curPage].then(function(pageNo) {
                    delete _pendingFindMatches[pageNo];

                    _calculatePageMatch(pageNo);
                });
            };

            var curPage = _searchState.highlightAll ? _firstLoadedPage : __CURRENT_PAGE;
            var count = 0;
            while (count != __TOTAL_PAGES) {
                _calLoop(curPage);
                curPage = _getNextPageNo(curPage, !_searchState.findPrevious);
                count += 1;
            }
        }

        if (_resumePageIdx) {
            return;
        }

        var offset = _offset;
        _pagesToSearch = numPages;

        if (offset.matchIdx !== null) {
            var numPageMatches = _pageMatches[offset.pageIdx].length;

            if (!previous && offset.matchIdx + 1 < numPageMatches || previous && offset.matchIdx > 0) {
                offset.matchIdx = previous ? offset.matchIdx - 1 : offset.matchIdx + 1;

                _updateMatch(true);
                return;
            }

            _advanceOffsetPage(previous);
        }

        _nextPageMatch();
    }

    function _advanceOffsetPage(previous) {
        var offset = _offset;
        offset.pageIdx = previous ? offset.pageIdx - 1 : offset.pageIdx + 1;
        offset.matchIdx = null;
        _pagesToSearch--;

        if (offset.pageIdx > __TOTAL_PAGES || offset.pageIdx < 1) {
            offset.pageIdx = previous ? __TOTAL_PAGES : 1;
            offset.wrapped = true;
        }
    }

    function _nextPageMatch() {
        if (_resumePageIdx !== null) {
            console.error('There can only be one pending page.');
        }

        var matches = null;

        do {
            var pageIdx = _offset.pageIdx;
            matches = _pageMatches[pageIdx];

            if (!matches) {
                _resumePageIdx = pageIdx;
                break;
            }
        } while (!_matchesReady(matches));
    }

    function _matchesReady(matches) {
        var offset = _offset;
        var numMatches = matches.length;
        var previous = _searchState.findPrevious;

        if (numMatches) {
            offset.matchIdx = previous ? numMatches - 1 : 0;

            _updateMatch(true);

            return true;
        }

        _advanceOffsetPage(previous);

        if (offset.wrapped) {
            offset.matchIdx = null;

            if (_pagesToSearch < 0) {
                _updateMatch(false);

                return true;
            }
        }

        return false;
    }

    function _updateMatch() {
        var found = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        _offset.wrapped = false;

        if (found) {
            var previousPage = _selected.pageIdx;
            _selected.pageIdx = _offset.pageIdx;
            _selected.matchIdx = _offset.matchIdx;

            if (previousPage !== -1 && previousPage !== _selected.pageIdx) {
                _updatePage(previousPage);
            }
        }

        if (_selected.pageIdx !== -1) {
            _scrollMatches = true;

            _updatePage(_selected.pageIdx);
        }
    }

    function _updatePage(index) {
        if (_scrollMatches && _selected.pageIdx === index) {
            var pageMatches = _pageMatches[index] || null;
            _convertMatches(pageMatches, index, function(matches) {
                if (matches && matches.length) {
                    _focusMatch(matches, function(success) {
                        if (success) {
                            _updateUIResultsCount();
                            _matchSelected = {
                                pageIdx:  _selected.pageIdx,
                                matchIdx: _selected.matchIdx
                            };
                        }
                    });
                }
            });
        }
    }

    function _focusMatch(matches, callback) {
        _ignoreScrollEvent = true;
        showPage(_selected.pageIdx, function() {
            var match = matches[_selected.matchIdx];
            if (match) {
                _removePdfSearchResultHighlights();
                var textElement = _highlightTextElements(match);
                var destination = null;
                if (textElement) {
                    destination = {
                        1: "",
                        2: parseFloat(textElement.style.left) + _getHorizontalOffset(textElement, match.begin.offset, 0, true) +
                            parseFloat(textElement.dataset.width) + _marginSize,
                        3: parseFloat(textElement.style.top) + parseFloat(textElement.clientHeight) / 2 + _marginSize
                    };
                }

                _scrollToPage(_selected.pageIdx, function(success) {
                    showPage(_selected.pageIdx, function() {
                        _ignoreScrollEvent = false;
                        _changePageOnScroll();
                        _updateNavbar();
                        if (callback) {
                            callback(true);
                        }
                        if (_pdfCallback) {
                            _pdfCallback(success);
                        }
                    }, 3);
                }, destination);
            }
        }, 2);
    }

    function _buildSearchResult() {
        _extractText();

        if (_findTimeout) {
            clearTimeout(_findTimeout);
            _findTimeout = null;
        }

        _findTimeout = setTimeout(function () {
            _nextMatch();

            _findTimeout = null;
        }, 250);
    }

    function _isEntireWord(content, startIdx, length) {
        if (startIdx > 0) {
            var first = content.charCodeAt(startIdx);
            var limit = content.charCodeAt(startIdx - 1);

            if (_getCharacterType(first) == _getCharacterType(limit)) {
                return false;
            }
        }

        var endIdx = startIdx + length - 1;

        if (endIdx < content.length - 1) {
            var last = content.charCodeAt(endIdx);

            var _limit = content.charCodeAt(endIdx + 1);

            if (_getCharacterType(last) == _getCharacterType(_limit)) {
                return false;
            }
        }

        return true;
    }

    function _getCharacterType (charCode) {
        var CharacterType = {
            SPACE: 0,
            ALPHA_LETTER: 1,
            PUNCT: 2,
            HAN_LETTER: 3,
            KATAKANA_LETTER: 4,
            HIRAGANA_LETTER: 5,
            HALFWIDTH_KATAKANA_LETTER: 6,
            THAI_LETTER: 7
        };

        function isAlphabeticalScript(charCode) {
            return charCode < 0x2E80;
        }

        function isAscii(charCode) {
            return (charCode & 0xFF80) === 0;
        }

        function isAsciiAlpha(charCode) {
            return charCode >= 0x61 && charCode <= 0x7A || charCode >= 0x41 && charCode <= 0x5A;
        }

        function isAsciiDigit(charCode) {
            return charCode >= 0x30 && charCode <= 0x39;
        }

        function isAsciiSpace(charCode) {
            return charCode === 0x20 || charCode === 0x09 || charCode === 0x0D || charCode === 0x0A;
        }

        function isHan(charCode) {
            return charCode >= 0x3400 && charCode <= 0x9FFF || charCode >= 0xF900 && charCode <= 0xFAFF;
        }

        function isKatakana(charCode) {
            return charCode >= 0x30A0 && charCode <= 0x30FF;
        }

        function isHiragana(charCode) {
            return charCode >= 0x3040 && charCode <= 0x309F;
        }

        function isHalfwidthKatakana(charCode) {
            return charCode >= 0xFF60 && charCode <= 0xFF9F;
        }

        function isThai(charCode) {
            return (charCode & 0xFF80) === 0x0E00;
        }

        if (isAlphabeticalScript(charCode)) {
            if (isAscii(charCode)) {
                if (isAsciiSpace(charCode)) {
                    return CharacterType.SPACE;
                } else if (isAsciiAlpha(charCode) || isAsciiDigit(charCode) || charCode === 0x5F) {
                    return CharacterType.ALPHA_LETTER;
                }

                return CharacterType.PUNCT;
            } else if (isThai(charCode)) {
                return CharacterType.THAI_LETTER;
            } else if (charCode === 0xA0) {
                return CharacterType.SPACE;
            }

            return CharacterType.ALPHA_LETTER;
        }

        if (isHan(charCode)) {
            return CharacterType.HAN_LETTER;
        } else if (isKatakana(charCode)) {
            return CharacterType.KATAKANA_LETTER;
        } else if (isHiragana(charCode)) {
            return CharacterType.HIRAGANA_LETTER;
        } else if (isHalfwidthKatakana(charCode)) {
            return CharacterType.HALFWIDTH_KATAKANA_LETTER;
        }

        return CharacterType.ALPHA_LETTER;
    }

    function _DisplayPdfSearchResultsDialogue(message) {
        var resultsDisplay = document.getElementById("PdfToolbarSearchResultsDiv");
        if (!resultsDisplay){
            return;
        }
        resultsDisplay.textContent = message;
    }

    String.prototype.insertTwo = function(idx1, str1, idx2, str2) {
        var slice1 = this.slice(0, idx1);
        var slice2 = this.slice(idx1, idx2);
        var slice3 = this.slice(idx2);
        return encodeHtml(slice1) + str1 + encodeHtml(slice2) + str2 + encodeHtml(slice3);
    };

    /**
     * Converts non-ASCII characters to . to follow behaviour from Adobe.
     * @param {string} str The string to convert
     * @return {string} Converted string
     * @private
     * @memberof ThingView
     **/
    function encodePathContent(str) {
        var buf = [];
        for (var i=str.length-1;i>=0;i--) {
            var code = str.charCodeAt(i);
            if (code > 126) {
                buf.unshift('.');
            } else {
                buf.unshift(str[i]);
            }
        }
        return buf.join('');
    }

    /**
     * Converts non-ASCII characters of a string to its html entities.
     * @param {string} str The string to convert
     * @return {string} Converted string
     * @private
     * @memberof ThingView
     **/
    function encodeContent(str) {
        var buf = [];
        for (var i=str.length-1;i>=0;i--) {
            var code = str.charCodeAt(i);
            if (code > 126) {
                buf.unshift(['&#', code, ';'].join(''));
            } else {
                buf.unshift(str[i]);
            }
        }
        return buf.join('');
    }

    /**
     * Converts a string to its html entities completely.
     * @param {string} str The string to convert
     * @return {string} Converted string
     * @private
     * @memberof ThingView
     **/
    function encodeHtml(str) {
        var buf = [];
        for (var i=str.length-1;i>=0;i--) {
            buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
        }
        return buf.join('');
    }

    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    function _removePdfSearchResultHighlights () {
        _matchSelected = {
            pageIdx:  -1,
            matchIdx: -1
        };
        if (_searchState) {
            _searchState.highlightAll = false;
        }
        _clearTextSelection();
        var textLayers = document.getElementsByClassName("PdfPageDisplayTextLayer");
        for (var i = 0; i < textLayers.length; i++) {
            var j = 0;
            while (j < textLayers[i].childNodes.length){
                if(textLayers[i].childNodes[j].className == "PdfSearchResultHighlight") {
                    textLayers[i].removeChild(textLayers[i].childNodes[j]);
                } else {
                    j++;
                }
            }
        }
    }

    function _convertMatches(matches, pageNo, callback) {
        if (!matches) {
            callback(null);
            return;
        }

        __PDF_DOC.getPage(pageNo).then(function(page) {
            page.getTextContent({ normalizeWhitespace: true }).then(function(textContent){
                var textContentItemsStr = [];
                var textLayerFrag = document.createDocumentFragment();
                PDFJS.renderTextLayer({
                    textContent: textContent,
                    container: textLayerFrag,
                    viewport: page.getViewport(__ZOOMSCALE, _pageRotation),
                    textContentItemsStr: textContentItemsStr,
                    enhanceTextSelection: true
                })._capability.promise.then(function(){
                    var i = 0,
                        iIndex = 0;
                    var end = textContentItemsStr.length - 1;
                    var queryLen = _searchTerm.length;
                    var result = [];

                    for (var m = 0, mm = matches.length; m < mm; m++) {
                        var matchIdx = matches[m];

                        while (i !== end && matchIdx >= iIndex + textContentItemsStr[i].length) {
                            iIndex += textContentItemsStr[i].length;
                            i++;
                        }

                        if (i === textContentItemsStr.length) {
                            console.error('Could not find a matching mapping');
                        }

                        var match = {
                            pageNo: pageNo,
                            begin: {
                            divIdx: i,
                            offset: matchIdx - iIndex
                            }
                        };

                        matchIdx += queryLen;

                        while (i !== end && matchIdx > iIndex + textContentItemsStr[i].length) {
                            iIndex += textContentItemsStr[i].length;
                            i++;
                        }

                        match.end = {
                            divIdx: i,
                            offset: matchIdx - iIndex
                        };
                        result.push(match);
                    }

                    callback(result);
                });
            });
        });
    }

    function _getHorizontalOffset(element, pos, length, first) {
        var canvas = null;
        if (_canvasTemplate == null) {
            canvas = document.createElement("canvas");

            _canvasTemplate = canvas.cloneNode(false);
        } else {
            canvas = _canvasTemplate.cloneNode(false);
        }
        var ctx = canvas.getContext('2d');
        ctx.font = element.style.fontSize + " " + element.style.fontFamily;

        if (first) {
            return (ctx.measureText(element.innerText.substr(0, pos)).width);
        } else {
            return (ctx.measureText(element.innerText.substr(pos, length)).width / 2);
        }

    }

    function _highlightTextElements(match) {
        var firstElement = null;
        var width = 0;

        var textLayer = document.querySelector("#PdfPageDisplayTextLayer" + match.pageNo);
        var i = match.begin.divIdx;
        var endi = match.end.divIdx;
        if (textLayer) {
            for (;i<=endi;i++) {
                var textElem = textLayer.querySelector("#PdfPageDisplayTextLayer" + match.pageNo + "_" + (i+1));
                if (textElem) {
                    if (!firstElement) firstElement = textElem;

                    var start = i == match.begin.divIdx ? match.begin.offset : 0;
                    var end = i == match.end.divIdx ? match.end.offset : textElem.innerText.length;
                    var length = end - start;

                    width += _getHorizontalOffset(textElem, start, length, false);

                    var highlightedTextElement = textElem.cloneNode(true);
                    highlightedTextElement.className = "PdfSearchResultHighlight";
                    highlightedTextElement.id = "PdfSearchResultHighlight" + match.pageNo + "_" + (i+1);
                    var htmlText = decodeHtml(highlightedTextElement.innerHTML);
                    htmlText = htmlText.insertTwo(start, "<span style='background-color: " + _uiColors.pdfViewer.textHighlight + "; color: " + _uiColors.pdfViewer.textHighlight + ";'>", end, "</span>");
                    highlightedTextElement.innerHTML = htmlText;

                    textElem.parentNode.appendChild(highlightedTextElement);
                }
            }
        }
        if (firstElement) {
            firstElement.dataset.width = width;
        }
        return firstElement;
    }

    function _showSearchResultHighlight() {
        if (_searchState && _searchState.highlightAll) {
            _highlightAllMatches();
        } else {
            if (_matchSelected.pageIdx != -1 &&
                _matchSelected.matchIdx != -1) {
                var pageNo = _matchSelected.pageIdx;
                var pageMatches = _pageMatches[pageNo] || null;
                _convertMatches(pageMatches, pageNo, function(matches) {
                    if (matches && matches.length) {
                        var match = matches[_matchSelected.matchIdx];
                        _highlightTextElements(match);
                    }
                });
            }
        }
    }

    function _checkLoadedPagesSearched() {
        var first = _firstLoadedPage;
        var last  = _lastLoadedPage;
        var running = false;
        for (var pageNo = first; pageNo <= last; pageNo++) {
            if (_pendingFindMatches[pageNo] == true) {
                running = true;
                break;
            }
        }

        if (running) {
            setTimeout(_checkLoadedPagesSearched, 100);
        } else {
            _highlightAllMatches();
        }
    }

    function _highlightAllMatches() {
        var first = _firstLoadedPage;
        var last  = _lastLoadedPage;
        for (var pageNo = first; pageNo <= last; pageNo++) {
            var pageMatches = _pageMatches[pageNo] || null;
            _convertMatches(pageMatches, pageNo, function(matches) {
                if (matches) {
                    for (var i=0;i<matches.length;i++) {
                        var match = matches[i];
                        _highlightTextElements(match);
                    }
                }
            });
        }
    }

    function _clearTextSelection() {
        if (window.getSelection) {
            if (window.getSelection().empty) { // Chrome, Edge and Firefox
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) { // IE
                window.getSelection().removeAllRanges();
            }
        }
    }

    function _getTextSelection() {
        _textSelection = {valid: false};
        var selection = window.getSelection();
        if (selection.type == "Range") {
            var startId = selection.anchorNode.parentNode.id;
            var startNumbers = startId.replace("PdfPageDisplayTextLayer","").split("_");
            var endId = selection.focusNode.parentNode.id;
            var endNumbers = endId.replace("PdfPageDisplayTextLayer","").split("_");

            if (startNumbers.length == 2 && endNumbers.length == 2) {
                var start = {
                    id: startId,
                    offset: selection.anchorOffset,
                    page: startNumbers[0],
                    no: startNumbers[1]
                };
                var end = {
                    id: endId,
                    offset: selection.focusOffset,
                    page: endNumbers[0],
                    no: endNumbers[1]
                };
                if (start.page < end.page) {
                    _textSelection.startNodeId = start.id;
                    _textSelection.startOffset = start.offset;
                    _textSelection.endNodeId = end.id;
                    _textSelection.endOffset = end.offset;
                } else if (start.page > end.page) {
                    _textSelection.startNodeId = end.id;
                    _textSelection.startOffset = end.offset;
                    _textSelection.endNodeId = start.id;
                    _textSelection.endOffset = start.offset;
                } else {
                    if (start.id < end.id) {
                        _textSelection.startNodeId = start.id;
                        _textSelection.startOffset = start.offset;
                        _textSelection.endNodeId = end.id;
                        _textSelection.endOffset = end.offset;
                    } else if (start.id > end.id) {
                        _textSelection.startNodeId = end.id;
                        _textSelection.startOffset = end.offset;
                        _textSelection.endNodeId = start.id;
                        _textSelection.endOffset = start.offset;
                    } else {
                        _textSelection.startNodeId = start.id;
                        _textSelection.startOffset = Math.min(start.offset, end.offset);
                        _textSelection.endNodeId = start.id;
                        _textSelection.endOffset = Math.max(start.offset, end.offset);
                    }
                }
                _textSelection.valid = true;
            }
        }
    }

    function _showTextSelection() {
        _clearTextSelection();
        if (_textSelection.valid) {
            var startNode = document.getElementById(_textSelection.startNodeId);
            var endNode = document.getElementById(_textSelection.endNodeId);
            if (startNode && startNode.firstChild &&
                endNode   && endNode.firstChild) {
                var range = document.createRange();
                range.setStart(startNode.firstChild, _textSelection.startOffset);
                range.setEnd(endNode.firstChild, _textSelection.endOffset);

                var selection = window.getSelection();
                selection.addRange(range);
            }
        }
    }

    //PDF SIDEBAR

    function _DisplayPdfNavigationBar (parent, pageNo) {
        var navDiv = document.getElementById("CreoViewDocumentNavbar");
        _clearNavPages(navDiv);
        if (!navDiv) {
            navDiv = document.createElement("div");
            navDiv.id = "CreoViewDocumentNavbar";
            navDiv.setAttribute('style', "background-color: " + _uiColors.sidebar.background + "; height: " + (parseInt(parent.clientHeight) - parseInt(parent.firstChild.clientHeight)) + "px; width: 100%; overflow-y: scroll; -webkit-overflow-scrolling: touch; scrollbar-width: none; -ms-overflow-style: none");
            var newStyle = "#CreoViewDocumentNavbar::-webkit-scrollbar {display: none}";
            if (document.querySelector('style') &&
                document.querySelector('style').textContent.search(newStyle) == -1) {
                document.querySelector('style').textContent += newStyle;
            } else if (!document.querySelector('style')) {
                var style = document.createElement('style');
                style.textContent = newStyle;
                document.getElementsByTagName('head')[0].appendChild(style);
            }
            navDiv.addEventListener("scroll", function(){
                _handleNavOnScroll(navDiv);
            });
            parent.appendChild(navDiv);
        }
        _PopulatePdfNavigationBar(navDiv, pageNo);
    }

    function _PopulatePdfNavigationBar (navDiv, pageNo) {
        _ignoreNavScrollEvent = true;
        _prepareNavWrapper(1, navDiv, function(){
            _navbar.firstLoadedPage = Math.max(pageNo - _navbar.bufferSize, 1);
            _navbar.lastLoadedPage  = Math.min(pageNo + _navbar.bufferSize, __TOTAL_PAGES);
            _displayNavPages(_navbar.firstLoadedPage, function(){
                _selectNavPage(document.getElementById("PdfNavPageWrapper" + pageNo), pageNo);
                _scrollNavbarToPage(navDiv, pageNo);
            });
        });
    }

    function _prepareNavWrapper (pageNo, navDiv, callback){
        __PDF_DOC.getPage(pageNo).then(function(page){
            var viewport = page.getViewport(1, _pageRotation);

            var width = _navSidebarWidth - 2 * (_navWrapperBorder + _navWrapperMargin);
            var height = width * viewport.height / viewport.width;
            var newZoomScale = height / viewport.height;
            height = Math.floor(height);

            var navWrapper = null;
            if (_navWrapperTemplate == null) {
                navWrapper = document.createElement("div");
                navWrapper.setAttribute("style", "margin: 10px auto; display: block; box-shadow: 3px 3px 10px rgba(0,0,0,0.5); cursor: pointer;");

                _navWrapperTemplate = navWrapper.cloneNode(false);
            } else {
                navWrapper = _navWrapperTemplate.cloneNode(false);
            }

            navWrapper.dataset.zoomScale = newZoomScale;
            navWrapper.style.height = height + "px";
            navWrapper.style.width = width + "px";
            navWrapper.id = "PdfNavPageWrapper" + pageNo;
            navWrapper.title = "Page " + pageNo;
            navWrapper.addEventListener("click", function(){
                _selectNavPage(navWrapper, pageNo);
                _LoadPage(_pdfCallback, pageNo);
            });
            navWrapper.addEventListener("mouseenter", function(){
                document.getElementById(_currentCanvasId).style.cursor = "pointer";
            });
            navWrapper.addEventListener("mouseleave", function(){
                document.getElementById(_currentCanvasId).style.cursor = "auto";
            });
            navDiv.appendChild(navWrapper);
            if (pageNo < __TOTAL_PAGES) {
                _prepareNavWrapper(pageNo+1, navDiv, callback);
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    }

    function _displayNavPages (pageNo, callback){
        __PDF_DOC.getPage(pageNo).then(function(page){
            var navWrapper = document.getElementById("PdfNavPageWrapper" + pageNo);
            if (navWrapper.childElementCount == 0) {
                var viewport = page.getViewport(parseFloat(navWrapper.dataset.zoomScale), _pageRotation);
                var canvas = document.createElement("canvas");
                canvas.id = "PdfNavPageCanvas" + pageNo;
                canvas.height = parseInt(viewport.height);
                canvas.width = parseInt(viewport.width);
                page.render({canvasContext: canvas.getContext('2d'), viewport: viewport}).then(function(){
                    if (navWrapper) {
                        navWrapper.appendChild(canvas);
                        if (pageNo < _navbar.lastLoadedPage){
                            _displayNavPages(pageNo+1, callback);
                        } else {
                            _ignoreNavScrollEvent = false;
                            if (callback) {
                                callback();
                            }
                        }
                    }
                });
            } else {
                if (pageNo < _navbar.lastLoadedPage){
                    _displayNavPages(pageNo+1, callback);
                } else {
                    _ignoreNavScrollEvent = false;
                    if (callback) {
                        callback();
                    }
                }
            }
        });
    }

    function _RemovePdfSideBar (parent){
        if (_sidebarEnabled) {
            var sideBar = document.getElementById("CreoViewDocumentSidebar");
            if (sideBar) {
                parent.removeChild(sideBar);
                var currentCanvas = document.getElementById(_currentCanvasId);
                if (currentCanvas) {
                    currentCanvas.parentNode.style.marginLeft = "auto";
                }
                parent.removeEventListener("mousemove", function(e){
                    _ResizePdfSideBar(e, parent, sidebarDiv, scrollWrapper);
                });
                parent.removeEventListener("mouseup", function(e){
                    if (_sidebarResize) {
                        parent.style.cursor = "auto";
                        sidebarDiv.style.cursor = "auto";
                        _sidebarResize = false;
                        if (_navbar.enabled) {
                            var navDiv = document.getElementById("CreoViewDocumentNavbar");
                            if ((parseInt(sidebarDiv.clientWidth) > _navSidebarWidth && navDiv.style.textAlign == "center") ||
                                (parseInt(sidebarDiv.clientWidth) <= _navSidebarWidth && navDiv.style.textAlign == "left")) {
                                _clearNavPages(navDiv);
                                _PopulatePdfNavigationBar(navDiv, _navbar.selectedPage);
                            }
                        }
                    }
                });
                _sidebarResize = false;
            }
        }
    }

    function _RemovePdfNavigationBar (parent){
        if (_sidebarEnabled && _navbar.enabled){
            parent.removeChild(document.getElementById("CreoViewDocumentNavbar"));
        }
    }

    function _clearNavPages (navDiv) {
        if (_navbar.enabled && navDiv){
            while (navDiv.firstChild) {
                navDiv.removeChild(navDiv.firstChild);
            }
        }
    }

    function clearInvisibleNavWrappers() {
        var navWrappers = document.querySelectorAll("div[data-zoom-scale]");
        for (var i = 0; i < navWrappers.length; i++) {
            var pageNo = (i+1);
            if (pageNo < _navbar.firstLoadedPage || pageNo > _navbar.lastLoadedPage) {
                while (navWrappers[i].firstChild) {
                    navWrappers[i].removeChild(navWrappers[i].firstChild);
                }
            }
        }
    }

    function _handleNavOnScroll(navDiv) {
        if (_ignoreScrollEvent || _ignoreNavScrollEvent) {
            return;
        }

        var currentNavPage = _getCurrentNavPage(navDiv);

        if (!document.getElementById("PdfNavPageWrapper" + currentNavPage).firstChild ||
            ((currentNavPage - 1) < _navbar.firstLoadedPage && currentNavPage > 1) ||
            ((currentNavPage + 1) > (_navbar.lastLoadedPage - 1) && currentNavPage < (__TOTAL_PAGES - 1))) {
            _ignoreNavScrollEvent = true;
            _navbar.firstLoadedPage = Math.max(currentNavPage - _navbar.bufferSize, 1);
            _navbar.lastLoadedPage  = Math.min(currentNavPage + _navbar.bufferSize, __TOTAL_PAGES);
            _displayNavPages(_navbar.firstLoadedPage, function(){
                clearInvisibleNavWrappers();
                _ignoreNavScrollEvent = false;
            });
        }
    }

    function _getCurrentNavPage (navDiv) {
        var scrollTop = navDiv.scrollTop;
        var navWrapper1 = document.getElementById("PdfNavPageWrapper1");
        var offsetTop1 = navWrapper1.offsetTop;

        var scrollCenter = scrollTop + navDiv.clientHeight / 2;
        for (var i=1; i<=__TOTAL_PAGES; i++) {
            var navWrapper = document.getElementById("PdfNavPageWrapper" + i);

            var offsetTop = navWrapper.offsetTop - offsetTop1;
            var offsetBottom = offsetTop + navWrapper.offsetHeight + _navWrapperMargin;
            if (offsetTop <= scrollCenter && scrollCenter < offsetBottom) {
                return i;
            }
        }
    }

    function _selectNavPage(navWrapper, pageNo) {
        if (pageNo < 1 || pageNo > __TOTAL_PAGES || !navWrapper) {
            return;
        }
        if (_navbar.selectedPage > 0 && _navbar.selectedPage <= __TOTAL_PAGES) {
            document.getElementById("PdfNavPageWrapper" + _navbar.selectedPage).style.border = "none";
        }
        navWrapper.style.border = "6px solid " + _uiColors.sidebar.navBorder;
        navWrapper.style.borderRadius = "3px";
        _navbar.selectedPage = pageNo;
    }

    function _scrollNavbarToPage (navDiv, pageNo) {
        if (pageNo > __TOTAL_PAGES || pageNo < 1 || !navDiv || (pageNo == 1 && __TOTAL_PAGES == 1)) {
            return;
        }

        var navWrapper1 = document.getElementById("PdfNavPageWrapper1");
        var offsetTop1 = navWrapper1.offsetTop;

        var navWrapper = document.getElementById("PdfNavPageWrapper" + pageNo);
        if (!navWrapper) return;

        var scrollBottom = navDiv.scrollTop + navDiv.clientHeight;
        var offsetTop = navWrapper.offsetTop - offsetTop1;
        var offsetBottom = offsetTop + navWrapper.offsetHeight + 2 * _navWrapperMargin;

        if (offsetTop < navDiv.scrollTop) {
            navDiv.scrollTop = offsetTop;
        } else if (offsetBottom > scrollBottom) {
            navDiv.scrollTop += (offsetBottom - scrollBottom);
        }

        _handleNavOnScroll(navDiv);
    }

    function _togglePdfSidePane () {
        var currentCanvas = document.getElementById(_currentCanvasId);
        if (!currentCanvas){
            return;
        }
        var parentNode = document.getElementById(_currentCanvasId).parentNode.parentNode;
        if (!parentNode){
            return;
        }
        if (_sidebarEnabled){
            _RemovePdfSideBar(parentNode);
            _adjustWrapperSize();
            _sidebarEnabled = false;
        } else {
            if (!_documentLoaded) return;
            _sidebarEnabled = true;
            var tempPageNo = __CURRENT_PAGE;
            if (_bookmarks.length <= 0) {
                _bookmarksBar.enabled = false;
                _navbar.enabled = true;
            }
            if (_navbar.enabled){
                _DisplayPdfNavigationBar(_CreateSideBar(parentNode), tempPageNo);
            } else if (_bookmarksBar.enabled){
                _DisplayPdfBookmarksBar(_CreateSideBar(parentNode));
            }
        }
    }

    function _CreateSideBar (parent) {
        if (document.getElementById("CreoViewDocumentSidebar")) {
            return;
        }
        var sidebarDiv = document.createElement("div");
        sidebarDiv.id = "CreoViewDocumentSidebar";
        sidebarDiv.style.float = "left";
        sidebarDiv.style.width = "25%";
        sidebarDiv.setAttribute('style', "float: left; width: " + _navSidebarWidth + "px;");
        if (_toolbarEnabled) {
            sidebarDiv.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
        } else {
            sidebarDiv.style.height = "100%";
        }
        var scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        parent.insertBefore(sidebarDiv, scrollWrapper);
        scrollWrapper.style.marginLeft = _navSidebarWidth + "px";
        var scrollWrapperTop = scrollWrapper.scrollTop;
        var scrollWrapperLeft = scrollWrapper.scrollLeft;
        if (_documentLoaded) {
            _refreshPDF(function(success){
                if (success) {
                    scrollWrapper.scrollTop = scrollWrapperTop;
                    scrollWrapper.scrollLeft = scrollWrapperLeft;

                    if (_pdfCallback) {
                        _pdfCallback(success);
                    }
                }
            });
        }

        var tabsDiv = document.createElement("div");
        tabsDiv.setAttribute('style', "width: 100%; height: " + _toolbarHeight + "px; background-color: " + _uiColors.sidebar.background + "; position: relative; text-align: left");
        _PopulateSideBarTabs(tabsDiv);
        sidebarDiv.appendChild(tabsDiv);

        sidebarDiv.addEventListener("mouseover", function (e) {
            if (!_sidebarResize &&
                e.clientX - parent.getBoundingClientRect().left > parseInt(sidebarDiv.style.width) - 5) {
                sidebarDiv.style.cursor = "e-resize";
            }
        });

        sidebarDiv.addEventListener("mousemove", function (e) {
            if (!_sidebarResize &&
                sidebarDiv.style.cursor == "e-resize" &&
                e.clientX - parent.getBoundingClientRect().left <= parseInt(sidebarDiv.style.width) - 5) {
                sidebarDiv.style.cursor = "auto";
            }
        });

        sidebarDiv.addEventListener("mousedown", function (e) {
            if (!_sidebarResize &&
                e.clientX - parent.getBoundingClientRect().left > parseInt(sidebarDiv.style.width) - 5) {
                parent.style.cursor = "e-resize";
                _sidebarResize = true;
            }
        });

        parent.addEventListener("mouseup", function(e){
            if (_sidebarResize) {
                parent.style.cursor = "auto";
                sidebarDiv.style.cursor = "auto";
                _sidebarResize = false;
                if (_navbar.enabled) {
                    var navDiv = document.getElementById("CreoViewDocumentNavbar");
                    if ((parseInt(sidebarDiv.clientWidth) > _navSidebarWidth && navDiv.style.textAlign == "center") ||
                        (parseInt(sidebarDiv.clientWidth) <= _navSidebarWidth && navDiv.style.textAlign == "left")) {
                        _clearNavPages(navDiv);
                        _PopulatePdfNavigationBar(navDiv, _navbar.selectedPage);
                    }
                }
            }
        });

        parent.addEventListener("mousemove", function(e){
            _ResizePdfSideBar(e, parent, sidebarDiv, scrollWrapper);
        });

        return sidebarDiv;
    }

    function _ResizePdfSideBar (e, parent, sidebarDiv, scrollWrapper) {
        if (_sidebarResize) {
            var newWidth = e.clientX - parent.getBoundingClientRect().left;
            if (newWidth > _navSidebarWidthLimit &&
                newWidth < parseInt(parent.clientWidth) - _navSidebarWidthLimit) {
                sidebarDiv.style.width = newWidth + "px";
                scrollWrapper.style.marginLeft = newWidth + "px";
                _navSidebarWidth = newWidth;
            }
        }
    }

    function _PopulateSideBarTabs (tabsDiv) {
        var navbarTab = _BuildDocumentToolbarButton('/icons/pdf_nav_pane.svg', false);
        navbarTab.id = "CreoSidebarNavbarButton";
        navbarTab.style.position = "absolute";
        navbarTab.style.bottom = "6px";
        navbarTab.style.left = "6px";
        navbarTab.style.backgroundColor = "inherit";
        if (_navbar.enabled) {
            navbarTab.style.backgroundColor = _uiColors.sidebar.tab;
        }
        tabsDiv.appendChild(navbarTab);

        var bookmarksTab = _BuildDocumentToolbarButton('/icons/pdf_bookmark.svg', false);
        bookmarksTab.id = "CreoSidebarBookmarksButton";
        bookmarksTab.style.position = "absolute";
        bookmarksTab.style.bottom = "6px";
        bookmarksTab.style.left = "38px";
        bookmarksTab.style.backgroundColor = "inherit";
        if (_bookmarksBar.enabled && _bookmarks.length > 0) {
            bookmarksTab.style.backgroundColor = _uiColors.sidebar.tab;
        }
        if (_bookmarks.length <= 0) {
            bookmarksTab.style.opacity = 0.5;
            bookmarksTab.style.cursor = "auto";
        }
        tabsDiv.appendChild(bookmarksTab);

        navbarTab.addEventListener("click", function(){
            if (!_navbar.enabled) {
                navbarTab.style.backgroundColor = _uiColors.sidebar.tab;
                bookmarksTab.style.backgroundColor = _uiColors.sidebar.background;
                _RemovePdfBookmarksBar(tabsDiv.parentNode);
                _navbar.enabled = true;
                _bookmarksBar.enabled = false;
                _DisplayPdfNavigationBar(tabsDiv.parentNode, __CURRENT_PAGE);
            }
        });
        if (_bookmarks.length > 0) {
            bookmarksTab.addEventListener("click", function(){
                if (!_bookmarksBar.enabled) {
                    bookmarksTab.style.backgroundColor = _uiColors.sidebar.tab;
                    navbarTab.style.backgroundColor = _uiColors.sidebar.background;
                    _RemovePdfNavigationBar(tabsDiv.parentNode);
                    _navbar.enabled = false;
                    _bookmarksBar.enabled = true;
                    _DisplayPdfBookmarksBar(tabsDiv.parentNode);
                }
            });
        }

        navbarTab.addEventListener("mouseenter", function(){
            if (!_navbar.enabled) {
                navbarTab.style.backgroundColor = _uiColors.sidebar.tab;
            }
        });
        navbarTab.addEventListener("mouseleave", function(){
            if (!_navbar.enabled) {
                navbarTab.style.backgroundColor = _uiColors.sidebar.background;
            }
        });
        if (_bookmarks.length > 0) {
            bookmarksTab.addEventListener("mouseenter", function(){
                if (!_bookmarksBar.enabled) {
                    bookmarksTab.style.backgroundColor = _uiColors.sidebar.tab;
                }
            });
            bookmarksTab.addEventListener("mouseleave", function(){
                if (!_bookmarksBar.enabled) {
                    bookmarksTab.style.backgroundColor = _uiColors.sidebar.background;
                }
            });
        }
    }

    function _DisplayPdfBookmarksBar (parent) {
        var bookmarksDiv = document.createElement("div");
        bookmarksDiv.id = "CreoViewDocumentBookmarksBar";
        bookmarksDiv.setAttribute('style', "background-color: " + _uiColors.sidebar.background + "; width: 100%; overflow-y: scroll; overflow-x: hidden; color: " + _uiColors.sidebar.text + "; line-height: 30px; scrollbar-width: none; -ms-overflow-style: none");
        var newStyle = "#CreoViewDocumentBookmarksBar::-webkit-scrollbar {display: none}";
        if (document.querySelector('style') &&
            document.querySelector('style').textContent.search(newStyle) == -1) {
            document.querySelector('style').textContent += newStyle;
        } else if (!document.querySelector('style')) {
            var style = document.createElement('style');
            style.textContent = newStyle;
            document.getElementsByTagName('head')[0].appendChild(style);
        }
        bookmarksDiv.style.height = (parseInt(parent.clientHeight) - parseInt(parent.firstChild.clientHeight)) + "px";
        parent.appendChild(bookmarksDiv);
        _PopulatePdfBookmarksBar(bookmarksDiv);
    }

    function _PopulatePdfBookmarksBar (bookmarksDiv) {
        var bookmarksContent = document.createElement("div");
        bookmarksContent.id = "CreoViewDocumentBookmarksTreeWrapper";
        bookmarksContent.style.paddingTop = "5px";
        if(_bookmarks.length == 0){
            return;
        } else {
            _BuildDocumentBookmarksTree(bookmarksContent);
        }
        bookmarksDiv.appendChild(bookmarksContent);
    }

    function _BuildDocumentBookmarksTree(container) {
        var bookmarksTree = document.createElement("ul");
        bookmarksTree.id = "CreoViewDocumentBookmarksTree";
        bookmarksTree.setAttribute('style',"-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; text-align: left; margin-left: -40px");
        for(var i = 0; i<_bookmarks.length; i++){
            _BuildDocumentBookmarksTreeContent(_bookmarks[i], bookmarksTree, 40);
        }
        container.appendChild(bookmarksTree);
    }

    function _BuildDocumentBookmarksTreeContent(bookmark, bookmarksTree, marginCul) {
        var liElem = document.createElement("li");
        liElem.className = "CreoBookmarkElement";
        liElem.setAttribute('style',"color: " + _uiColors.sidebar.text + "; background-color: transparent; position: relative; display: block");
        var highlightDiv = document.createElement("div");
        highlightDiv.setAttribute('style', "background-color: inherit; height: 30px; width: 100%; position: absolute; top: 0px; z-index: 1");
        liElem.appendChild(highlightDiv);
        if (bookmark.items.length == 0) {
            var spanElem = document.createElement("span");
            spanElem.textContent = bookmark.title;
            spanElem.setAttribute('style', "cursor: pointer; margin-left: " + (marginCul + 31) + "px; z-index: 2; position: relative; display: block; word-wrap: break-word");
            spanElem.addEventListener("click", function(){
                _ShowPdfBookmark(bookmark.title);
            });
            spanElem.addEventListener("mouseenter", function(){
                highlightDiv.style.height = spanElem.clientHeight;
                highlightDiv.style.backgroundColor = _uiColors.sidebar.tab;
            });
            spanElem.addEventListener("mouseleave", function(){
                highlightDiv.style.backgroundColor = "inherit";
            });
            liElem.appendChild(spanElem);
        } else {
            var caretElem = document.createElement("span");
            caretElem.setAttribute('style', "cursor: pointer; z-index: 2; position: absolute; margin-left: " + marginCul + "px;");
            var caretImg = document.createElement("img");
            caretImg.src = ThingView.resourcePath + "icons/pdf_previous_find.svg";
            caretImg.setAttribute('style', "transform: rotate(-90deg); margin-top: 7px");
            caretElem.appendChild(caretImg);
            caretElem.addEventListener("click", function(){
                if(liElem.childNodes[3].style.display == "none"){
                    liElem.childNodes[3].style.display = "block";
                    caretImg.style.transform = "none";
                } else {
                    liElem.childNodes[3].style.display = "none";
                    caretImg.style.transform = "rotate(-90deg)";
                }
            });

            var spanElem = document.createElement("span");
            spanElem.setAttribute('style', "cursor: pointer; margin-left: " + (marginCul + 31) + "px; z-index: 2; position: relative; display: block; word-wrap: break-word");
            spanElem.textContent = bookmark.title;
            spanElem.addEventListener("click", function(){
                _ShowPdfBookmark(bookmark.title);
            });
            spanElem.addEventListener("mouseenter", function(){
                highlightDiv.style.height = spanElem.clientHeight;
                highlightDiv.style.backgroundColor = _uiColors.sidebar.tab;
            });
            spanElem.addEventListener("mouseleave", function(){
                highlightDiv.style.backgroundColor = "inherit";
            });
            liElem.appendChild(caretElem);
            liElem.appendChild(spanElem);
            var ulElem = document.createElement("ul");
            ulElem.setAttribute('style', "display: none; margin-left: " + (0 - marginCul) + "px");
            liElem.appendChild(ulElem);
            for (var i = 0; i<bookmark.items.length; i++){
                _BuildDocumentBookmarksTreeContent(bookmark.items[i], ulElem, marginCul*2);
            }
        }
        bookmarksTree.appendChild(liElem);
    }

    function _ClearPdfBookmarksBar (bookmarksDiv) {
        if (_sidebarEnabled && _bookmarksBar.enabled) {
            while (bookmarksDiv.firstChild) {
                bookmarksDiv.removeChild(bookmarksDiv.firstChild);
            }
        }
    }

    function _RemovePdfBookmarksBar (parent) {
        if (_sidebarEnabled && _bookmarksBar.enabled){
            parent.removeChild(document.getElementById("CreoViewDocumentBookmarksBar"));
        }
    }

    function _BuildDocumentToolbarButton (imgURL, onLoadEvent) {
        var buttonDiv = document.createElement("div");
        buttonDiv.setAttribute('style', "-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; background-color: " + _uiColors.toolbar.background + "; margin-top: 6px; padding: 6px; cursor: pointer; display: inline-block; width: 16px; height: 16px");
        var buttonImage = document.createElement("img");
        if (onLoadEvent) {
            _AddToolbarButtonLoad(buttonImage);
        }
        buttonImage.src = ThingView.resourcePath + imgURL;
        buttonDiv.appendChild(buttonImage);
        return buttonDiv;
    }

    function _AddToolbarButtonMouseOver (button) {
        button.addEventListener("mouseenter", function(){
            button.style.backgroundColor = _uiColors.toolbar.activeButton;
        });
        button.addEventListener("mouseleave", function(){
            button.style.backgroundColor = _uiColors.toolbar.background;
        });
    }

    function _AddToolbarButtonLoad (buttonImage) {
        buttonImage.onload = function(){
            _toggleToolbarCover("none");
        };
    }

    // PDF ROTATE

    function _RotateDocumentPages (clockwise) {
        var newRotation = (_pageRotation + 360 + (clockwise ? 90 : -90)) % 360;
        _getScrollCenterData(__ZOOMSCALE);
        _pageRotation = newRotation;
        _refreshPDF(function(success){
            if (success) {
                if (_sidebarEnabled && _navbar.enabled) {
                    _DisplayPdfNavigationBar (document.getElementById(_currentCanvasId).parentNode.parentNode, __CURRENT_PAGE);
                }
                _pdfCallback();
            }
        }, {pageRotation: newRotation});
    }

    function _checkPageRotation() {
        if (_pageRotation == 0)
            return 0;
        else if (_pageRotation == 90)
            return 1;
        else if (_pageRotation == 180)
            return 2;
        else if (_pageRotation == 270)
            return 3;
    }

    // PDF PRINT

    function _PrintPdf (parent) {
        if (!_printEnabled || (_print && _print.running)) {
            return;
        }
        _print = {running: true};
        _preparePrintStyling();
        var printDiv = _preparePdfPrintDiv(parent);
        window.addEventListener('afterprint', _removePdfPrintDiv);
        _saveCurrentDocCursor();
        _populatePrintDiv(printDiv, 150/72, 1, __TOTAL_PAGES, function(){
            document.getElementById(_currentCanvasId).style.cursor = _printDocCursor;
            window.print();
        });
    }

    function _populatePrintDiv (printDiv, zoomScale, firstPage, lastPage, callback) {
        _preparePrintWrapper(firstPage, lastPage, printDiv, zoomScale, function(){
            _preparePrintPage (firstPage, lastPage, zoomScale, function(){
                if (!_filterPdfMarkups && _pdfParsedAnnotationSet != null && _pdfParsedAnnotationSet.length > 0) {
                    _preparePrintMarkup(0, printDiv, zoomScale, callback);
                } else {
                    callback();
                }
            });
        });
    }

    function  _preparePrintWrapper (pageNo, lastPage, printDiv, zoomScale, callback){
        __PDF_DOC.getPage(pageNo).then(function(page){
            var viewport = page.getViewport(zoomScale);
            var width = parseFloat(viewport.width);
            var height = parseFloat(viewport.height);
            var printWrapper = null;
            if (_printWrapperTemplate == null) {
                printWrapper = document.createElement("div");
                printWrapper.id = "PdfPrintWrapper" + pageNo;
                printWrapper.className = "PdfPrintElement PdfPrintWrapper";
                printWrapper.height = height;
                printWrapper.width = width;
                printWrapper.style.position = "relative";

                _printWrapperTemplate = printWrapper.cloneNode(false);
            } else {
                printWrapper = _printWrapperTemplate.cloneNode(false);

                printWrapper.id = "PdfPrintWrapper" + pageNo;
                printWrapper.height = height;
                printWrapper.width  = width;
            }
            printDiv.appendChild(printWrapper);
            if (pageNo >= lastPage) {
                if (callback) {
                    callback();
                }
            } else {
                _preparePrintWrapper(pageNo+1, lastPage, printDiv, zoomScale, callback);
            }
        });
    }

    function _preparePrintPage (pageNo, lastPage, zoomScale, callback){
        __PDF_DOC.getPage(pageNo).then(function(page){
            var printWrapper = document.getElementById("PdfPrintWrapper" + pageNo);
            var viewport = page.getViewport(zoomScale);
            var width = parseFloat(viewport.width);
            var height = parseFloat(viewport.height);
            var canvas = null;
            if (_printPageTemplate == null) {
                canvas = document.createElement("canvas");
                canvas.className = "PdfPrintElement";
                canvas.id = "PdfPrintPage" + pageNo;
                canvas.width = width;
                canvas.height = height;

                _printPageTemplate = canvas.cloneNode(false);
            } else {
                canvas = _printPageTemplate.cloneNode(false);

                canvas.id = "PdfPrintPage" + pageNo;
                canvas.width = width;
                canvas.height = height;
            }
            page.render({canvasContext: canvas.getContext('2d'), viewport: viewport, intent: 'print'}).then(function(){
                printWrapper.appendChild(canvas);
                if (pageNo < lastPage){
                    _preparePrintPage(pageNo+1, lastPage, zoomScale, callback);
                } else {
                    if (callback) {
                        callback();
                    }
                }
            });
        });
    }

    function _preparePrintMarkup (markupNo, printDiv, zoomScale, callback){
        _displayPrintMarkup (_pdfParsedAnnotationSet[markupNo], printDiv, zoomScale);
        if (markupNo < _pdfParsedAnnotationSet.length-1) {
            _preparePrintMarkup(markupNo+1, printDiv, zoomScale, callback);
        } else {
            var canvases = document.getElementsByClassName("PdfPrintAnnotationCanvas");
            var defs = "<defs class='PdfPrintAnnotation'><marker class='PdfPrintAnnotation' id='ClosedArrowPrint' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path class='PdfPrintAnnotation' d='M2,6 L9,1 L9,10 Z' style='fill:rgb(255,0,0);' /></marker><marker class='PdfPrintAnnotation' id='ClosedArrowNotePrint' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path class='PdfPrintAnnotation' d='M2,6 L9,1 L9,10 Z' style='fill:rgb(255,255,255);stroke:rgb(255,0,0)' /></marker><marker id='OpenArrowPrint' class='PdfPrintAnnotation' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path class='PdfPrintAnnotation' d='M9,1 L2,6 L9,10' style='fill:rgba(255,255,255,0);stroke:rgb(255,0,0)' /></marker><marker id='OpenArrowNotePrint' class='PdfPrintAnnotation' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path class='PdfPrintAnnotation' d='M9,1 L2,6 L9,10' style='fill:rgba(255,255,255,0);stroke:rgb(255,0,0)' /></marker><marker class='PdfPrintAnnotation' id='CirclePrint' markerWidth='9' markerHeight='9' refX='5' refY='5' orient='auto'><circle class='PdfPrintAnnotation' cx='5' cy='5' r='3' style='fill:rgb(255,0,0);' /></marker></defs>";
            var svgFooter = "</svg>";
            for (var i = 0; i < canvases.length; i++) {
                var canvasChildren = canvases[i].childNodes;
                var tempInnerHtml = "";
                var stamps = [];
                for (var j = 0; j < canvasChildren.length; j++) {
                    if (canvasChildren[j].tagName != "IMG") {
                        tempInnerHtml += canvasChildren[j].outerHTML;
                    } else {
                        stamps.push(canvasChildren[j]);
                    }
                }
                var svgHeader = "<svg class=\"PdfPrintAnnotation\" preserveAspectRatio=\"none\" " +
                    "height=\"" + canvases[i].clientHeight + "px\" " +
                    "width=\"" + canvases[i].clientWidth + "px\">";

                if (tempInnerHtml != "") {
                    canvases[i].innerHTML = svgHeader + defs + tempInnerHtml + svgFooter;
                } else {
                    canvases[i].innerHTML = "";
                }
                for (var k = 0; k < stamps.length; k++) {
                    canvases[i].appendChild(stamps[k]);
                }
            }
            if (callback) {
                callback();
            }
        }
    }

    function _displayPrintMarkup (annotation, printDiv, zoomScale) {
        if (!annotation || !annotation.visible) return;

        var pdfCanvas = document.getElementById("PdfPrintWrapper" + (annotation.pageNo+1));
        if (!pdfCanvas) return;

        var canvasId = "PdfPrintAnnotationCanvas" + annotation.pageNo;
        var canvas = document.getElementById(canvasId);
        if(!canvas || canvas.parentNode.parentNode != printDiv){
            var width = parseFloat(pdfCanvas.width);
            var height = parseFloat(pdfCanvas.height);
            if (_printMarkupTemplate == null) {
                canvas = document.createElement("div");
                canvas.setAttribute('id', canvasId);
                canvas.setAttribute('class', "PdfPrintAnnotationCanvas PdfPrintAnnotation");
                canvas.setAttribute('width', width + "px");
                canvas.setAttribute('height', height + "px");
                canvas.setAttribute('style',"position: absolute; top: 0px; left: 0px; height: " + height + "px; width: " + width + "px; z-index: 3");

                _printMarkupTemplate = canvas.cloneNode(false);
            } else {
                canvas = _printMarkupTemplate.cloneNode(false);

                canvas.id = canvasId;
                canvas.width = width + "px";
                canvas.height = height + "px";
                canvas.style.width = width + "px";
                canvas.style.height = height + "px";
            }
            pdfCanvas.insertBefore(canvas, pdfCanvas.firstChild);
        }
        switch (annotation.type) {
            case _markupTypes.leaderLine:
                _displayPdfLeaderLine(annotation, canvas, true, zoomScale);
                break;
            case _markupTypes.polyline:
                _displayPdfPolyLine(annotation, canvas, true, zoomScale);
                break;
            case _markupTypes.rectangle:
            case _markupTypes.rectangleFilled:
                _displayPdfRectangle(annotation, canvas, true, zoomScale);
                break;
            case _markupTypes.ellipse:
            case _markupTypes.ellipseFilled:
                _displayPdfCircle(annotation, canvas, true, zoomScale);
                break;
            case _markupTypes.polygon:
            case _markupTypes.polygonFilled:
                _displayPdfPolygon(annotation, canvas, true, zoomScale);
                break;
            case _markupTypes.freehand:
                _displayPdfFreehand(annotation, canvas, true, zoomScale);
                break;
            case _markupTypes.textStrikethrough:
                _displayPdfStrikeThrough(annotation, canvas, true, zoomScale);
                break;
            case _markupTypes.textUnderline:
                _displayPdfUnderline(annotation, canvas, true, zoomScale);
                break;
            case _markupTypes.textHighlight:
                _displayPdfHighlight(annotation, canvas, true, zoomScale);
                break;
            case _markupTypes.note:
            case _markupTypes.noteLeader:
                _displayPdfNote(annotation, canvas, true, zoomScale);
                break;
            case _markupTypes.stamp:
                var stamp = _displayPdfStamp(annotation, canvas, true, zoomScale);
                canvas.appendChild(stamp);
                break;
            default:
                console.log("Annotation type not supported");
                break;
        }
    }

    function _preparePrintStyling () {
        //We don't need to remove a users @media print styling because the rules of precedence say the last in wins
        var newStyle = "@media print{ body :not(.PdfPrintElement){ display: none} .PdfPrintElement{width: 100% !important; border: none !important; padding: 0px !important; margin: 0px !important; visibility: visible !important} .PdfPrintAnnotationCanvas{transform: scale(1.01, 1.015) !important; margin: 1% auto auto 0.5% !important; visibility: visible !important} .PdfPrintElement, .PdfPrintAnnotation{height: 100% !important; overflow: visible !important; box-shadow: none !important; display: block !important; visibility: visible !important} .PdfPrintAnnotationStamp, .PdfPrintAnnotationNote {display: block !important} @page{ margin: 0px} *{ float: none !important}}";
        if (!document.querySelector('style')) {
            var style = document.createElement('style');
            style.textContent = newStyle;
            document.getElementsByTagName('head')[0].appendChild(style);
        } else {
            document.querySelector('style').textContent += newStyle;
        }
    }

    function _removePrintStyling () {
        document.querySelector('style').textContent = document.querySelector('style').textContent.replace("@media print{ body :not(.PdfPrintElement){ display: none} .PdfPrintElement{width: 100% !important; border: none !important; padding: 0px !important; margin: 0px !important; visibility: visible !important} .PdfPrintAnnotationCanvas{transform: scale(1.01, 1.015) !important; margin: 1% auto auto 0.5% !important; visibility: visible !important} .PdfPrintElement, .PdfPrintAnnotation{height: 100% !important; overflow: visible !important; box-shadow: none !important; display: block !important; visibility: visible !important} .PdfPrintAnnotationStamp, .PdfPrintAnnotationNote {display: block !important} @page{ margin: 0px} *{ float: none !important}}", "");
    }

    function _addPdfPrintClass (element) {
        if (element.className != "") {
            element.className += " ";
        }
        element.className += "PdfPrintElement";
        if (element.parentNode && element.parentNode != document.body) {
            _addPdfPrintClass(element.parentNode);
        }
    }

    function _saveCurrentDocCursor() {
        _printDocCursor = document.getElementById(_currentCanvasId).style.cursor != "" ? document.getElementById(_currentCanvasId).style.cursor : "auto";
        document.getElementById(_currentCanvasId).style.cursor = "wait";
    }

    function _removePdfPrintDiv () {
        window.removeEventListener("afterprint", _removePdfPrintDiv);
        if (!_printEnabled || !_print || !_print.running) {
            return;
        }
        _print = null;
        _removePrintStyling();
        var printDiv = document.getElementById("PdfPrintDiv");
        printDiv.parentNode.removeChild(printDiv);
    }

    //PDF PRINT BUFFERS

    function _GetPdfPrintBuffers (parent, firstPage, lastPage, width, height, callback) {
        if (!_printEnabled) return;

        if (_print && _print.running) {
            if (firstPage == lastPage) {
                _printCallback = {
                    pageNo: firstPage,
                    width: width,
                    height: height,
                    callback: callback
                };
            }
            return;
        }
        if (firstPage == lastPage && _prefetchedPage &&
            _prefetchedPage.pageNo == firstPage &&
            (_prefetchedPage.width >= width || _prefetchedPage.height >= height)) {
            callback([_prefetchedPage]);
            _prefetchedPage = null;
            _getPrintBuffers(parent, firstPage+1, firstPage+1, width, height, true);
        } else {
            _getPrintBuffers(parent, firstPage, lastPage, width, height, false, callback, function() {
                _getPrintBuffers(parent, firstPage+1, firstPage+1, width, height, true);
            });
        }
    }

    function _preparePdfPrintDiv(parent) {
        var printDiv = null;
        if (_printDivTemplate == null) {
            printDiv = document.createElement("div");
            printDiv.id = "PdfPrintDiv";
            printDiv.className = "PdfPrintElement";
            printDiv.style.visibility = "hidden";

            _printDivTemplate = printDiv.cloneNode(false);
        } else {
            printDiv = _printDivTemplate.cloneNode(false);
        }
        parent.appendChild(printDiv);

        return printDiv;
    }

    function _checkPrintCallback(parent) {
        if (_printCallback) {
            if (_printCallback.pageNo == _prefetchedPage.pageNo) {
                _printCallback.callback([_prefetchedPage]);
                var nextPageNo = _prefetchedPage.pageNo+1;
                var width = _printCallback.width;
                var height = _printCallback.height;
                _prefetchedPage = null;
                _printCallback = null;

                _getPrintBuffers(parent, nextPageNo, nextPageNo, width, height, true);
            } else {
                _prefetchedPage = null;
                _GetPdfPrintBuffers(parent, _printCallback.pageNo, _printCallback.pageNo, _printCallback.width, _printCallback.height, _printCallback.callback);
            }
        }
    }

    function _getPrintBuffers(parent, firstPage, lastPage, width, height, prefetch, pdfCallback, callback) {
        if (prefetch && (firstPage > __TOTAL_PAGES)) {
            return;
        }

        _print = {running: true};
        var printDiv = _preparePdfPrintDiv(parent);
        _preparePrintStyling();
        _saveCurrentDocCursor();
        _getPrintBuffersZoomScale(width, height, firstPage, lastPage, function(zoomScale){
            _populatePrintDiv(printDiv, zoomScale, firstPage, lastPage, function(){
                if (firstPage == null) {
                    firstPage = 1;
                }
                if (lastPage == null) {
                    lastPage = __TOTAL_PAGES;
                }
                if (firstPage > lastPage) {
                    var tempPage = firstPage;
                    firstPage = lastPage;
                    lastPage = tempPage;
                }
                firstPage = Math.min(Math.max(firstPage, 1), __TOTAL_PAGES);
                lastPage = Math.max(Math.min(lastPage, __TOTAL_PAGES), 1);
                var bufferArray = [];
                _generatePdfPrintBuffers(firstPage, lastPage, bufferArray, function() {
                    if (prefetch) {
                        _prefetchedPage = bufferArray[0];
                        _getPdfPrintBuffersCallback();
                        _checkPrintCallback(parent);
                    } else {
                        _getPdfPrintBuffersCallback(bufferArray, pdfCallback);
                        callback();
                    }
                });
            });
        });
    }

    function _handleNextPrintPage(pageNo, lastPage, result, callback) {
        if (pageNo >= lastPage) {
            if (callback) {
                callback();
            }
        } else {
            _generatePdfPrintBuffers(pageNo+1, lastPage, result, callback);
        }
    }

    function _generatePdfPrintBuffers(pageNo, lastPage, result, callback) {
        var printPage = document.getElementById("PdfPrintPage" + pageNo);
        if (printPage) {
            var pageContext = printPage.getContext('2d');
            var markupDiv = document.getElementById("PdfPrintAnnotationCanvas" + (pageNo-1));
            if (markupDiv) {
                var imgList = markupDiv.getElementsByTagName("IMG");
                var imgArray = Array.from(imgList);
                for (var i=0;i<imgArray.length;i++) {
                    pageContext.drawImage(
                        imgArray[i],
                        parseInt(imgArray[i].style.left), parseInt(imgArray[i].style.top),
                        parseInt(imgArray[i].style.width), parseInt(imgArray[i].style.height)
                    );
                }

                var svgList = markupDiv.getElementsByTagName("svg");
                if (svgList.length) {
                    var svgArray = Array.from(svgList);
                    _drawSvgImages(svgArray, printPage, function() {
                        result.push(_getPdfPageBufferFromContext(printPage));
                        _handleNextPrintPage(pageNo, lastPage, result, callback);
                    });
                } else {
                    result.push(_getPdfPageBufferFromContext(printPage));
                    _handleNextPrintPage(pageNo, lastPage, result, callback);
                }
            } else {
                result.push(_getPdfPageBufferFromContext(printPage));
                _handleNextPrintPage(pageNo, lastPage, result, callback);
            }
        } else {
            _handleNextPrintPage(pageNo, lastPage, result, callback);
        }
    }

    function _drawSvgImages(list, canvas, callback) {
        var svg = list.shift();
        if (svg) {
            var svgImg = new Image();
            var svgXml = new XMLSerializer().serializeToString(svg);
            try {
                svgImg.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgXml)));
                svgImg.onload = function() {
                    canvas.getContext("2d").drawImage(svgImg, 0, 0);
                    _drawSvgImages(list, canvas, callback);
                };
            } catch (e) {
                console.warn("Failed to generate image from SVG markup, skip this page and continue");
                _drawSvgImages(list, canvas, callback);
            }
        } else {
            callback();
        }
    }

    function _getPdfPageBufferFromContext (printPage) {
        return {
            width:  parseInt(printPage.width),
            height: parseInt(printPage.height),
            pageNo: parseInt(printPage.id.substring("PdfPrintPage".length)),
            png:    printPage.toDataURL()
        };
    }

    function _getPdfPrintBuffersCallback (bufferArray, callback) {
        _removePdfPrintDiv();
        document.getElementById(_currentCanvasId).style.cursor = _printDocCursor;
        if (callback) {
            callback(bufferArray);
        }
    }

    function _getPrintBuffersZoomScale(width, height, firstPage, lastPage, callback) {
        if (width == null || height == null) {
            if (callback) {
                callback(150/72);
                return;
            }
        }
        var pageWidth = 0;
        var pageHeight = 0;
        _getLargestPrintWidthAndHeight(firstPage, pageWidth, pageHeight, lastPage, function(maxHeightWidthObj){
            var heightZoom = height / maxHeightWidthObj.maxPageHeight;
            var widthZoom = width / maxHeightWidthObj.maxPageWidth;
            if (callback) {
                callback(Math.min(heightZoom, widthZoom));
                return;
            }
        });
    }

    function _getLargestPrintWidthAndHeight(pageNo, pageWidth, pageHeight, lastPage, callback) {
        if (pageNo > lastPage) {
            if (callback){
                callback({maxPageWidth: pageWidth, maxPageHeight: pageHeight});
            }
        } else {
            __PDF_DOC.getPage(pageNo).then(function(page){
                var viewport = page.getViewport(1);
                pageWidth = Math.max(pageWidth, parseInt(viewport.width));
                pageHeight = Math.max(pageHeight, parseInt(viewport.height));
                _getLargestPrintWidthAndHeight(pageNo+1, pageWidth, pageHeight, lastPage, callback);
            });
        }
    }

    // MISC

    function _handleBrowserResize () {
        if (!_documentLoaded) return;

        if(_toolbarEnabled){
            _resizeDocumentToolbar(document.getElementById(_parentCanvasId), _toolbarGroups);
        }
        _adjustWrapperSize();
    }

     // PDF MARKUPS

    function _LoadPdfAnnotationSet(documentViewable, parentCanvasId, docScene, structure, annoSet, isWindowless, documentCallback) {
        _ignoreScrollEvent = true;
        _pdfAnnotationId = -1;
        _pdfParsedAnnotationSet = [];
        _markupMode.selectedAnnotations = [];
        _markupMode.hiddenSelectedAnnotations = [];
        _markupHistory = {stack: [], index: -1};
        docScene.LoadPdf(documentViewable.idPath, documentViewable.index, structure, function(success) {
            if (!success) {
                return;
            }
            docScene.GetPdfBuffer(function(buffer){
                _LoadPdfDocument(parentCanvasId, buffer, false, isWindowless, function(){
                    _pdfRawAnnotationSet = annoSet;
                    _pdfParsedAnnotationSet = [];
                    _pdfAnnotationId = -1;
                    _pageAnnoSetList = {};
                    _processPdfAnnotationSet(documentCallback);
                });
            });
        });
    }

    function _ApplyPdfAnnotationSet(annoSet, documentCallback) {
        _pdfRawAnnotationSet = annoSet;
        _pdfAnnotationId = -1;
        _pdfParsedAnnotationSet = [];
        _pageAnnoSetList = {};
        _markupHistory = {stack: [], index: -1};
        _markupMode.selectedAnnotations = [];
        _markupMode.hiddenSelectedAnnotations = [];
        _processPdfAnnotationSet(documentCallback);
    }

    function _processPdfAnnotationSet(callback) {
        if (!_pdfRawAnnotationSet) {
            return;
        }

        if (_pdfParsedAnnotationSet.length == 0) {
            _parsePdfRawAnnotationSet(_pdfRawAnnotationSet);
        }

        _displayPdfAnnotations(_pdfParsedAnnotationSet);
        _ignoreScrollEvent = false;
        if (callback) {
            callback();
        }
        if (_markupObserver) {
            _markupObserver.set("annoSetLoaded", _deepCopyParsedAnnotationSet(_pdfParsedAnnotationSet));
        }
    }

    function _deepCopyParsedAnnotationSet(annoSet) {
        var copySet = [];
        for (var i = 0; i < annoSet.length; i++) {
            if (annoSet[i]) {
                var copyAnno = {};
                copyAnno.id = annoSet[i].id;
                copyAnno.type = annoSet[i].type;
                copyAnno.visible = annoSet[i].visible;
                copyAnno.isNew = annoSet[i].isNew;
                copySet.push(copyAnno);
            } else {
                copySet.push(null);
            }
        }
        return copySet;
    }

    function _displayPdfAnnotations(annoSet) {
        var canvases = document.getElementsByClassName("PdfAnnotationCanvas");
        for (var i = 0; i < canvases.length; i++) {
            canvases[i].innerHTML = "";
        }
        var stamps = [];
        for (var k = 0; k < annoSet.length; k++){
            var stamp = _displayPdfAnnotation(annoSet[k]);
            if (stamp){
                stamps.push(stamp);
            }
        }
        var svgFooter = "</svg>";
        for (i = 0; i < canvases.length; i++) {
            var canvasPageNo = parseInt(canvases[i].id.substr(canvases[i].className.length));
            var svgHeader = "<svg id='PdfAnnotationSvgLayer" + canvasPageNo + "' height = " + canvases[i].clientHeight + " width = " + canvases[i].clientWidth + " style = 'z-index: 2; position: absolute; left: 0px; top: 0px'>";
            var tempInnerHtml = canvases[i].innerHTML;
            canvases[i].innerHTML = svgHeader + _svgDefs + tempInnerHtml + svgFooter;
        }
        for (var j = stamps.length-1; j >= 0; j--){
            var pushStamp = stamps[j];
            var canvas = document.getElementById("PdfAnnotationCanvas" + pushStamp.pageNo);
            canvas.insertBefore(pushStamp.stampImage, canvas.firstChild);
        }
        var deletableMarkups = document.getElementsByClassName("PdfAnnotationElementSel");
        for(var m = 0; m < deletableMarkups.length; m++) {
            _addMarkupSelectEvents(deletableMarkups[m]);
        }
        var parent = document.getElementById(_parentCanvasId);
        parent.addEventListener("mousedown", _checkDeselectPdfAnnotation);
        window.addEventListener("keydown", _deletePdfAnnotationEvent);
    }

    /**
     * Add the events needed to move a markup
     * Should not be called for any markups which should not be moved via mouse / touch drag (text decoration)
     * @param {DOM element} markup The markup requiring the events
     * @private
     * @memberof ThingView
     **/
    function _addMarkupMoveEvents (markup) {
        markup.addEventListener("mousedown", _handleMovePdfAnnoEvent);
        markup.addEventListener("mouseleave", _handleMovePdfAnnoEvent);
        markup.addEventListener("mouseenter", _handleMovePdfAnnoEvent);
        if (markup.className.baseVal && markup.className.baseVal == "PdfMarkupAnchorBox") {
            markup.parentNode.parentNode.parentNode.addEventListener("mouseup", _handleMovePdfAnnoEvent);
            markup.parentNode.parentNode.parentNode.addEventListener("mousemove", _handleMovePdfAnnoEvent);
        } else {
            markup.parentNode.parentNode.addEventListener("mouseup", _handleMovePdfAnnoEvent);
            markup.parentNode.parentNode.addEventListener("mousemove", _handleMovePdfAnnoEvent);
        }
    }

    /**
     * Remove the events needed to move a markup
     * Should not be called for any markups which should not be moved via mouse / touch drag (text decoration)
     * @param {DOM element} markup The markup requiring the events
     * @private
     * @memberof ThingView
     **/
    function _removeMarkupMoveEvents (markup) {
        var proxyEvent = new Event('mouseup');
        markup.parentNode.parentNode.dispatchEvent(proxyEvent);
        markup.parentNode.parentNode.removeEventListener("mouseup", _handleMovePdfAnnoEvent);
        markup.parentNode.parentNode.removeEventListener("mousemove", _handleMovePdfAnnoEvent);
    }

    function _addMarkupSelectEvents (markup) {
        markup.addEventListener("mouseup", _handleSelectPdfAnnoEvent);
    }

    function _deletePdfAnnotationEvent (e) {
        if(e.key == "Delete") {
            _deleteSelectedPdfAnnotations();
        }
    }

    function _getAnnotationCanvasTransform(rot, diff) {
        if (rot == 1) {
            // 90 deg
            return "rotate(90deg) translate(-" + diff + "px,-" + diff + "px)";
        } else if (rot == 2) {
            // 180 deg
            return "rotate(180deg)";
        } else if (rot == 3) {
            // 270 deg
            return "rotate(270deg) translate(" + diff + "px," + diff + "px)";
        } else {
            // 0 deg
            return 'unset';
        }
    }

    function _displayPdfAnnotation(annotation){
        if (!annotation || !annotation.visible || annotation.pageNo < (_firstLoadedPage-1) || annotation.pageNo > (_lastLoadedPage-1)){
            return null;
        }
        var canvasId = "PdfAnnotationCanvas" + annotation.pageNo;
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var canvas = document.getElementById(canvasId);
        if(!canvas || canvas.parentNode.parentNode != canvasWrapper){
            var pdfCanvas = document.getElementById("PdfPageDisplayWrapper" + (annotation.pageNo+1));
            var width = _checkPageRotation()%2==1 ? parseFloat(pdfCanvas.height) : parseFloat(pdfCanvas.width);
            var height = _checkPageRotation()%2==1 ? parseFloat(pdfCanvas.width) : parseFloat(pdfCanvas.height);
            if (_annotationTemplate == null) {
                canvas = document.createElement("div");
                canvas.setAttribute('id', canvasId);
                canvas.setAttribute('class', "PdfAnnotationCanvas");
                canvas.setAttribute('width', width + "px");
                canvas.setAttribute('height', height + "px");
                canvas.setAttribute('style',"position: absolute; top: 0px; left: 0px; height: " + height + "px; width: " + width + "px; z-index: 2");
                canvas.style.transform = _getAnnotationCanvasTransform(_checkPageRotation(), Math.abs(width - height)/2);

                _annotationTemplate = canvas.cloneNode(false);
            } else {
                canvas = _annotationTemplate.cloneNode(false);

                canvas.id = canvasId;
                canvas.width = width + "px";
                canvas.height = height + "px";
                canvas.style.width = width + "px";
                canvas.style.height = height + "px";
                canvas.style.transform = _getAnnotationCanvasTransform(_checkPageRotation(), Math.abs(width - height)/2);
            }

            if (_filterPdfMarkups) {
                canvas.style.visibility = "hidden";
            }
            pdfCanvas.insertBefore(canvas, pdfCanvas.firstChild);
        }
        switch (annotation.type) {
            case _markupTypes.leaderLine:
                _displayPdfLeaderLine(annotation, canvas, false, __ZOOMSCALE);
                return null;
            case _markupTypes.polyline:
                _displayPdfPolyLine(annotation, canvas, false, __ZOOMSCALE);
                return null;
            case _markupTypes.rectangle:
            case _markupTypes.rectangleFilled:
                _displayPdfRectangle(annotation, canvas, false, __ZOOMSCALE);
                return null;
            case _markupTypes.ellipse:
            case _markupTypes.ellipseFilled:
                _displayPdfCircle(annotation, canvas, false, __ZOOMSCALE);
                return null;
            case _markupTypes.polygon:
            case _markupTypes.polygonFilled:
                _displayPdfPolygon(annotation, canvas, false, __ZOOMSCALE);
                return null;
            case _markupTypes.freehand:
                _displayPdfFreehand(annotation, canvas, false, __ZOOMSCALE);
                return null;
            case _markupTypes.textStrikethrough:
                _displayPdfStrikeThrough(annotation, canvas, false, __ZOOMSCALE);
                return null;
            case _markupTypes.textUnderline:
                _displayPdfUnderline(annotation, canvas, false, __ZOOMSCALE);
                return null;
            case _markupTypes.textHighlight:
                _displayPdfHighlight(annotation, canvas, false, __ZOOMSCALE);
                return null;
            case _markupTypes.note:
            case _markupTypes.noteLeader:
                _displayPdfNote(annotation, canvas, false, __ZOOMSCALE);
                return null;
            case _markupTypes.stamp:
                return {
                    stampImage: _displayPdfStamp(annotation, canvas, false, __ZOOMSCALE),
                    pageNo: annotation.pageNo
                };
            default:
                console.log("Annotation type not supported");
                return null;
        }
    }

    function _parsePdfRawAnnotationSet(annoSet) {
        for (var i = 0; i < annoSet.length; i++) {
            var annotation = _parsePdfRawAnnotation(annoSet[i]);
            if (annotation) {
                _pdfParsedAnnotationSet.push(annotation);
                var pageNo = Number(annotation.pageNo+1);
                if (!_pageAnnoSetList[pageNo]) {
                    _pageAnnoSetList[pageNo] = [];
                }
                _pageAnnoSetList[pageNo].push(_pdfParsedAnnotationSet.length-1);
            }
        }
    }

    function _parsePdfRawAnnotation(rawAnno){
        switch (rawAnno.type){
            case "LeaderLine":
                return _parseLeaderLinePdfRawAnno(rawAnno.data, rawAnno.pageNo);
            case "PolyLine":
                return _parsePolyLinePdfRawAnno(rawAnno.data, rawAnno.pageNo);
            case "Rectangle":
                return _parseRectanglePdfRawAnno(rawAnno.data, rawAnno.pageNo);
            case "Circle":
                return _parseCirclePdfRawAnno(rawAnno.data, rawAnno.pageNo);
            case "Polygon":
                return _parsePolygonPdfRawAnno(rawAnno.data, rawAnno.pageNo);
            case "Freehand":
                return _parseFreehandPdfRawAnno(rawAnno.data, rawAnno.pageNo);
            case "StrikeThrough":
                return _parseStrikeThroughPdfRawAnno(rawAnno.data, rawAnno.pageNo);
            case "Underline":
                return _parseUnderlinePdfRawAnno(rawAnno.data, rawAnno.pageNo);
            case "Highlight":
                return _parseHighlightPdfRawAnno(rawAnno.data, rawAnno.pageNo);
            case "Note":
                return _parseNotePdfRawAnno(rawAnno.data, rawAnno.pageNo);
            case "Stamp":
                return _parseStampPdfRawAnno(rawAnno.data, rawAnno.pageNo);
            default:
                console.log("Annotation type not supported");
                return null;
        }
    }

    function _getElementFromString(string, prefix, suffix) {
        if (suffix) {
            return string.substring(string.indexOf(prefix) + prefix.length, string.lastIndexOf(suffix));
        } else {
            return string.substring(string.indexOf(prefix) + prefix.length);
        }
    }

    function _getCorrectedBoundingBox(vertices, canvas, zoomScale){
        var arrX = [], arrY = [];
        for (var i=0;i<vertices.length;i++) {
            if (i%2 == 0) arrX.push(vertices[i]);
            else arrY.push(vertices[i]);
        }
        var box = {
            x1: Math.min.apply(Math, arrX) * zoomScale,
            x2: Math.max.apply(Math, arrX) * zoomScale,
            y1: parseInt(canvas.style.height) - Math.max.apply(Math, arrY) * zoomScale,
            y2: parseInt(canvas.style.height) - Math.min.apply(Math, arrY) * zoomScale
        };
        return box;
    }

    function _parseLeaderLinePdfRawAnno(data, pageNumber) {
        var visibleVal = _getElementFromString(data, "Visible: ") == "true" ? true : false;
        var annotation = {
            type: _markupTypes.leaderLine,
            id: _getNextPdfAnnotationId(),
            vertices: _stringToFloatArray(_getElementFromString(data, "Vertices: ", ", Bounding")),
            boundingBox: _stringToFloatArray(_getElementFromString(data, "Bounding box: ", ", Head")),
            pageNo: pageNumber,
            head: _getElementFromString(data, "Head: ", ", Tail"),
            tail: _getElementFromString(data, "Tail: ", ", Visible"),
            visible: visibleVal,
            isNew: false
        };
        return annotation;
    }

    function _parsePolyLinePdfRawAnno(data, pageNumber) {
        var annotation = _parseLeaderLinePdfRawAnno(data, pageNumber);
        annotation.type = _markupTypes.polyline;
        return annotation;
    }

    function _parseRectanglePdfRawAnno(data, pageNumber) {
        var filledVal = _getElementFromString(data, "Filled: ", ", Visible") == "true" ? true : false;
        var visibleVal = _getElementFromString(data, "Visible: ") == "true" ? true : false;
        var annotation = {
            type: filledVal ? _markupTypes.rectangleFilled : _markupTypes.rectangle ,
            id: _getNextPdfAnnotationId(),
            vertices: _stringToFloatArray(_getElementFromString(data, "Vertices: ", ", Filled")),
            pageNo: pageNumber,
            filled: filledVal,
            visible: visibleVal,
            isNew: false
        };
        return annotation;
    }

    function _parseCirclePdfRawAnno(data, pageNumber) {
        var annotation = _parseRectanglePdfRawAnno(data, pageNumber);
        if (!annotation.filled) {
            annotation.type = _markupTypes.ellipse;
        } else {
            annotation.type = _markupTypes.ellipseFilled;
        }
        return annotation;
    }

    function _parsePolygonPdfRawAnno(data, pageNumber) {
        var filledVal = _getElementFromString(data, "Filled: ", ", Visible") == "true" ? true : false;
        var visibleVal = _getElementFromString(data, "Visible: ") == "true" ? true : false;
        var annotation = {
            type: filledVal ? _markupTypes.polygonFilled : _markupTypes.polygon,
            id: _getNextPdfAnnotationId(),
            vertices: _stringToFloatArray(_getElementFromString(data, "Vertices: ", ", Bounding")),
            boundingBox: _stringToFloatArray(_getElementFromString(data, "Bounding box: ", ", Filled")),
            pageNo: pageNumber,
            filled: filledVal,
            visible: visibleVal,
            isNew: false
        };
        return annotation;
    }

    function _parseFreehandPdfRawAnno(data, pageNumber) {
        var visibleVal = _getElementFromString(data, "Visible: ") == "true" ? true : false;
        var annotation = {
            type: _markupTypes.freehand,
            id: _getNextPdfAnnotationId(),
            vertices: _stringToFloatArray(_getElementFromString(data, "Vertices: ", ", Bounding")),
            boundingBox: _stringToFloatArray(_getElementFromString(data, "Bounding box: ", ", Visible")),
            pageNo: pageNumber,
            visible: visibleVal,
            isNew: false
        };
        return annotation;
    }

    function _parseStrikeThroughPdfRawAnno(data, pageNumber) {
        var visibleVal = _getElementFromString(data, "Visible: ") == "true" ? true : false;
        var annotation = {
            type: _markupTypes.textStrikethrough,
            id: _getNextPdfAnnotationId(),
            vertices: _stringToFloatArray(_getElementFromString(data, "Vertices: ", ", Bounding")),
            boundingBox: _stringToFloatArray(_getElementFromString(data, "Bounding box: ", ", Visible")),
            pageNo: pageNumber,
            visible: visibleVal,
            isNew: false
        };
        return annotation;
    }

    function _parseUnderlinePdfRawAnno(data, pageNumber) {
        var annotation = _parseStrikeThroughPdfRawAnno(data, pageNumber);
        annotation.type = _markupTypes.textUnderline;
        return annotation;
    }

    function _parseHighlightPdfRawAnno(data, pageNumber) {
        var annotation = _parseStrikeThroughPdfRawAnno(data, pageNumber);
        annotation.type = _markupTypes.textHighlight;
        return annotation;
    }

    function _parseNotePdfRawAnno(data, pageNumber) {
        var extractedContent = _getElementFromString(data, "Content: ", ", Font Family: ");
        data = data.replace(extractedContent, "");
        var lastIndex = 0;
        while(extractedContent.indexOf("\\r", lastIndex) != -1){
            var checkIndex = extractedContent.indexOf("\\r", lastIndex) - 1;
            if (!(checkIndex >= 0 && extractedContent.indexOf("\\\\r", lastIndex) == checkIndex)){
                var extractedSubstr = extractedContent.substr(extractedContent.indexOf("\\r", lastIndex));
                lastIndex = extractedContent.indexOf("\\r", lastIndex);
                var replaceSubstr = extractedSubstr.replace("\\r", " \n");
                extractedContent = extractedContent.replace(extractedSubstr, replaceSubstr);
            } else {
                lastIndex = extractedContent.indexOf("\\r", lastIndex) + 1;
                var extractIndex = checkIndex;
                while(extractIndex >= 1 && extractedContent[extractIndex-1] == "\\"){
                    extractIndex--;
                }
                var extractedSubstr = extractedContent.substr(extractIndex, checkIndex - extractIndex + 3);
                var replaceSubstr = Array((extractedSubstr.length-1)/2).join("\\");
                extractedContent = extractedContent.replace(extractedSubstr.substr(0,extractedSubstr.length-2), replaceSubstr);
            }
        }
        extractedContent = _sanitizeSvgText(extractedContent);
        var visibleVal = _getElementFromString(data, "Visible: ", ", Box Diffs:") == "true" ? true : false;
        var annotation = {
            type: _markupTypes.note,
            id: _getNextPdfAnnotationId(),
            boundingBox: _stringToFloatArray(_getElementFromString(data, "Bounding box: ", ", Content")),
            pageNo: pageNumber,
            content: extractedContent,
            fontFamily: _getElementFromString(data, "Font Family: ", ", Text Alignment: "),
            textAlignment: _getElementFromString(data, "Text Alignment: ", ", Font Color:"),
            fontColor: _getElementFromString(data, "Font Color: ", ", Font Size:"),
            fontSize: parseFloat(_getElementFromString(data, "Font Size: ", ", Head:")),
            head: "",
            leaderLineVertices: [],
            visible: visibleVal,
            boxDiffs: _stringToFloatArray(_getElementFromString(data, "Box Diffs: ")),
            isNew: false
        };
        if(data.indexOf("Leader Line Vertices: ") != -1){
            annotation.type = _markupTypes.noteLeader;
            annotation.head = _getElementFromString(data, "Head: ", ", Leader Line Vertices");
            annotation.leaderLineVertices = _stringToFloatArray(_getElementFromString(data, "Leader Line Vertices: ", ", Visible"));
        } else {
            annotation.head = _getElementFromString(data, "Head: ", ", Visible");
        }
        return annotation;
    }

    function _parseStampPdfRawAnno(data, pageNumber) {
        var visibleVal = _getElementFromString(data, "Visible: ", ", Inflated Stream") == "true" ? true : false;
        var annotation = {
            type: _markupTypes.stamp,
            id: _getNextPdfAnnotationId(),
            vertices: _stringToFloatArray(_getElementFromString(data, "Vertices: ", ", Filter")),
            pageNo: pageNumber,
            filter: _getElementFromString(data, "Filter: ", ", Stream Length"),
            streamLength: parseInt(_getElementFromString(data, "Stream Length: ", ", Inflated Length")),
            inflatedLength: parseInt(_getElementFromString(data, "Inflated Length: ", ", Height")),
            height: parseInt(_getElementFromString(data, "Height: ", ", Width")),
            width: parseInt(_getElementFromString(data, "Width: ", ", Color Space")),
            colorSpace: _getElementFromString(data, "Color Space: ", ", Bits Per Component"),
            bitsPerComponent: parseInt(_getElementFromString(data, "Bits Per Component: ", ", Visible")),
            stream: _getElementFromString(data, "Inflated Stream: ", ", Raw Stream"),
            rawStream: _getElementFromString(data, "Raw Stream: "),
            visible: visibleVal,
            isNew: false
        };
        return annotation;
    }

    // Displays
    function _displayPdfLeaderLine(annotation, canvas, printElement, zoomScale) {
        var svgElement =  "<line id = 'PdfAnnotationElement" + annotation.id + "' class = 'PdfAnnotationElement PdfAnnotationElementSel";
        if (printElement) {
            svgElement += " PdfPrintAnnotation";
        }
        svgElement += "' data-annoid=" + annotation.id + " data-selected='false' x1 = '" + (annotation.vertices[0] * zoomScale) + "' y1 = '" + (parseInt(canvas.style.height) - (annotation.vertices[1] * zoomScale)) + "' x2 = '" + (annotation.vertices[2] * zoomScale) + "' y2 = '" + (parseInt(canvas.style.height) - (annotation.vertices[3] * zoomScale)) + "' style = 'stroke:rgb(255,0,0);stroke-width:" + (1.5 * zoomScale) +"'";
        var head = "";
        if(annotation.head != "None"){
            head = "marker-start='url(#" + annotation.head;
            if (printElement) {
                head += "Print";
            }
            head += ")' ";
        }
        var tail = "";
        if(annotation.tail != "None"){
            tail = "marker-end='url(#" + annotation.tail;
            if (printElement) {
                tail += "Print";
            }
            tail += ")'";
        }
        var svgCombined = "<g";
        if (printElement) {
            svgCombined += " class = 'PdfPrintAnnotation'";
        }
        svgCombined += ">" + svgElement + head + tail + " /></line>" + "</g>";
        canvas.innerHTML += svgCombined;
    }

    function _displayPdfPolyLine(annotation, canvas, printElement, zoomScale) {
        var svgElement = "<polyline";
        if (printElement) {
            svgElement += " class = 'PdfPrintAnnotation'";
        }
        svgElement += " points='" + _createPolyPointPath(annotation, canvas, zoomScale) + "' style='fill:none;stroke:rgb(255,0,0);stroke-width:" + 1.5 * zoomScale + "' ";
        var head = "";
        if (annotation.head != "None"){
            head = "marker-start='url(#" + annotation.head;
            if (printElement) {
                head += "Print";
            }
            head += ")' ";
        }
        var tail = "";
        if (annotation.tail != "None"){
            tail = "marker-end='url(#" + annotation.tail;
            if (printElement) {
                tail += "Print";
            }
            tail += ")'";
        }
        var selectorBox = "";
        if (!printElement) {
            selectorBox = _buildPolyLineSelectorBox(annotation.vertices, canvas, annotation.id, true);
        }
        var svgCombined = "<g";
        if (printElement) {
            svgCombined += " class = 'PdfPrintAnnotation'";
        }
        svgCombined += ">" + svgElement + head + tail + " /></polyline>" + selectorBox + "</g>";
        canvas.innerHTML += svgCombined;
    }

    function _displayPdfRectangle(annotation, canvas, printElement, zoomScale) {
        var box = _getCorrectedBoundingBox(annotation.vertices, canvas, zoomScale);
        var fill = annotation.filled ? "rgb(255,0,0)" : "transparent";
        var svgElement = "<g><rect id = 'PdfAnnotationElement" + annotation.id + "' class = 'PdfAnnotationElement PdfAnnotationElementSel PdfAnnoMovable";
        if (printElement) {
            svgElement += " PdfPrintAnnotation";
        }
        svgElement += "' data-annoid=" + annotation.id + " data-selected='false' x='" + box.x1 + "' y='" + box.y1 + "' width='" + (box.x2 - box.x1) + "' height='" + (box.y2 - box.y1) + "' style='fill:" + fill + ";stroke:rgb(255,0,0);stroke-width:" + (1.5*zoomScale) + ";opacity:0.5' /></rect></g>";
        canvas.innerHTML += svgElement;
    }

    function _displayPdfCircle(annotation, canvas, printElement, zoomScale) {
        var box = _getCorrectedBoundingBox(annotation.vertices, canvas, zoomScale);
        var cx = (box.x2 + box.x1)/2;
        var cy = (box.y2 + box.y1)/2;
        var rx = (box.x2 - box.x1)/2;
        var ry = (box.y2 - box.y1)/2;
        var fill = annotation.filled ? "rgb(255,0,0)" : "transparent";
        var svgElement = "<g><ellipse id = 'PdfAnnotationElement" + annotation.id + "' class = 'PdfAnnotationElement PdfAnnotationElementSel PdfAnnoMovable";
        if (printElement) {
            svgElement += " PdfPrintAnnotation";
        }
        svgElement += "' data-annoid=" + annotation.id + " data-selected='false' cx='" + cx + "' cy='" + cy + "' rx='" + rx + "' ry='" + ry + "' style='stroke:rgb(255,0,0);stroke-width:" + (1.5*zoomScale) + ";fill:" + fill + ";opacity:0.5'/></ellipse></g>";
        canvas.innerHTML +=svgElement;
    }

    function _displayPdfPolygon(annotation, canvas, printElement, zoomScale) {
        var fill = annotation.filled ? "rgb(255,0,0)" : "transparent";
        var svgElement = "<polygon id = 'PdfAnnotationElement" + annotation.id + "' class = 'PdfAnnotationElement PdfAnnoMovable";
        if (printElement) {
            svgElement += " PdfPrintAnnotation";
        }
        svgElement += "' data-annoid=" + annotation.id + " data-selected='false' points='" + _createPolyPointPath(annotation, canvas, zoomScale) + "' style='stroke:rgb(255,0,0);stroke-width:" + (1.5*zoomScale) + ";fill:" + fill + ";opacity:0.5'/></polygon>";
        canvas.innerHTML += svgElement;
    }

    function _displayPdfFreehand(annotation, canvas, printElement, zoomScale) {
        var path = "M" + (annotation.vertices[0] * zoomScale) + " " + (parseInt(canvas.style.height) - (annotation.vertices[1] * zoomScale));
        for (var i = 2; i <= annotation.vertices.length-4; i+=4) {
            path += " Q" + (annotation.vertices[i] * zoomScale) + " " + (parseInt(canvas.style.height) - (annotation.vertices[i+1] * zoomScale)) + " " + (annotation.vertices[i+2] * zoomScale) + " " + (parseInt(canvas.style.height) - (annotation.vertices[i+3] * zoomScale));
        }
        var svgElement = "<path id = 'PdfAnnotationElement" + annotation.id + "' data-annoid = '" + annotation.id + "' data-selected = 'false' class = '";
        if (printElement) {
            svgElement += "PdfPrintAnnotation ";
        }
        svgElement += "PdfAnnotationElementSel' d='" + path + "' style='fill:none;stroke:rgb(255,0,0);stroke-width:" + (1.5*zoomScale) + ";stroke-linejoin:round' /></path>";
        var selectorLine = "";
        if (!printElement) {
            selectorLine = "<path id = 'PdfMarkupAnchorBox" + annotation.id + "' class='PdfMarkupFreehandBox' data-annoid='" + annotation.id + "' d='" + path + "' style='fill:none;stroke:" + _uiColors.anchor.boxFill + ";stroke-width:" + (4*zoomScale) + ";stroke-linejoin:round' /></path>";
        }
        var innerHTML = "<g";
        if (printElement) {
            innerHTML += " class=\"PdfPrintAnnotation\"";
        }
        innerHTML +=">" + svgElement + selectorLine + "</g>";
        canvas.innerHTML += innerHTML;
    }

    function _getOrderedTextPathVertices (annotation, canvas, zoomScale, i) {
        var x1 = annotation.vertices[i] * zoomScale;
        var y1 = (parseInt(canvas.style.height) - ((annotation.vertices[i+1]) * zoomScale));
        var x2 = annotation.vertices[i+2] * zoomScale;
        var y2 = (parseInt(canvas.style.height) - ((annotation.vertices[i+3]) * zoomScale));
        var x3 = annotation.vertices[i+4] * zoomScale;
        var y3 = (parseInt(canvas.style.height) - ((annotation.vertices[i+5]) * zoomScale));
        var x4 = annotation.vertices[i+6] * zoomScale;
        var y4 = (parseInt(canvas.style.height) - ((annotation.vertices[i+7]) * zoomScale));
        return _orderRectangleVertices(x1, y1, x2, y2, x3, y3, x4, y4);
    }

    function _displayPdfStrikeThrough(annotation, canvas, printElement, zoomScale) {
        var path = "";
        for (var i = 0; i < annotation.vertices.length; i+=8){
            var pathVertices = _getOrderedTextPathVertices(annotation, canvas, zoomScale, i);
            path += " M" + ((pathVertices[0] + pathVertices[6]) / 2) + " " + ((pathVertices[1] + pathVertices[7]) / 2) + " L" + ((pathVertices[2] + pathVertices[4]) / 2) + " " + ((pathVertices[3] + pathVertices[5]) / 2);
        }
        var svgElement = "<path id = 'PdfAnnotationElement" + annotation.id + "' class = 'PdfAnnotationElement PdfAnnotationElementSel";
        if (printElement) {
            svgElement += " PdfPrintAnnotation";
        }
        svgElement += "' data-annoid=" + annotation.id + " data-selected='false' d='" + path + "' style='stroke:rgb(255,0,0);stroke-width:" + (1.5*zoomScale) + "' /></path>";
        var svgCombined = "<g";
        if (printElement) {
            svgCombined += " class = 'PdfPrintAnnotation'";
        }
        svgCombined += ">" + svgElement + "</g>";
        canvas.innerHTML += svgCombined;
    }

    function _displayPdfUnderline(annotation, canvas, printElement, zoomScale){
        var path = "";
        for (var i = 0; i < annotation.vertices.length; i+=8){
            var pathVertices = _getOrderedTextPathVertices(annotation, canvas, zoomScale, i);
            var px1, py1, px2, py2;
            py1 = Math.max(pathVertices[1], pathVertices[7]);
            py2 = Math.max(pathVertices[3], pathVertices[5]);
            if (pathVertices[1] >= pathVertices[3]) {
                px1 = Math.max(pathVertices[0], pathVertices[6]);
                px2 = Math.max(pathVertices[2], pathVertices[4]);
            } else {
                px1 = Math.min(pathVertices[0], pathVertices[6]);
                px2 = Math.min(pathVertices[2], pathVertices[4]);
            }
            path += " M" + px1 + " " + py1 + " L" + px2 + " " + py2;
        }
        var svgElement = "<path id = 'PdfAnnotationElement" + annotation.id + "' class = 'PdfAnnotationElement PdfAnnotationElementSel";
        if (printElement) {
            svgElement += "PdfPrintAnnotation";
        }
        svgElement += "' data-annoid=" + annotation.id + " data-selected='false' d='" + path + "' style='stroke:rgb(106,217,38);stroke-width:" + (1.5*zoomScale) + "' /></path>";
        var svgCombined = "<g";
        if (printElement) {
            svgCombined += " class = 'PdfPrintAnnotation'";
        }
        svgCombined += ">" + svgElement + "</g>";
        canvas.innerHTML += svgCombined;
    }

    function _displayPdfHighlight(annotation, canvas, printElement, zoomScale){
        var path = "";
        for (var i = 0; i < annotation.vertices.length; i+=8){
            var pathVertices = _getOrderedTextPathVertices(annotation, canvas, zoomScale, i);
            var xCurve1 = (pathVertices[2] + pathVertices[4]) / 2;
            var xCurve2 = (pathVertices[0] + pathVertices[6]) / 2;
            if (xCurve1 > xCurve2) {
                xCurve1 += _uiSizes.highlight.margin * __ZOOMSCALE;
                xCurve2 -= _uiSizes.highlight.margin * __ZOOMSCALE;
            } else {
                xCurve1 -= _uiSizes.highlight.margin * __ZOOMSCALE;
                xCurve2 += _uiSizes.highlight.margin * __ZOOMSCALE;
            }
            var yCurve1 = (pathVertices[3] + pathVertices[5]) / 2
            var yCurve2 = (pathVertices[1] + pathVertices[7]) / 2
            path += " M" + pathVertices[0] + " " + pathVertices[1] + " L" + pathVertices[2] + " " + pathVertices[3] + " S" + xCurve1 + " " + yCurve1 + " " + pathVertices[4] + " " + pathVertices[5] + " L" + pathVertices[6] + " " + pathVertices[7] + " S" + xCurve2 + " " + yCurve2 + " " + pathVertices[0] + " " + pathVertices[1];
        }
        var svgElement = "<g><path class = 'PdfAnnotationElement PdfAnnotationElementSel";
        if (printElement) {
            svgElement += " PdfPrintAnnotation";
        }
        svgElement += "' data-annoid=" + annotation.id + " data-selected='false' id = 'PdfAnnotationElement" + annotation.id + "' d='" + path + "' style='stroke:rgb(255,171,0);stroke-width:1;fill:rgb(255,171,0);opacity:0.5' /></path></g>";
        canvas.innerHTML += svgElement;
    }

    function _orderRectangleVertices (x1, y1, x2, y2, x3, y3, x4, y4) {
        var orderedVertices = [x1, y1, x2, y2, x3, y3, x4, y4];
        var crossProduct1 = _getCrossProductForRect(x1, y1, x3, y3, x2, y2);
        var crossProduct2 = _getCrossProductForRect(x1, y1, x3, y3, x4, y4);
        if ((crossProduct1 > 0 && crossProduct2 < 0) || (crossProduct1 < 0 && crossProduct2 > 0)) {
            return orderedVertices;
        }
        orderedVertices = [x1, y1, x3, y3, x2, y2, x4, y4];
        crossProduct1 = _getCrossProductForRect(x1, y1, x2, y2, x3, y3);
        crossProduct2 = _getCrossProductForRect(x1, y1, x2, y2, x4, y4);
        if ((crossProduct1 > 0 && crossProduct2 < 0) || (crossProduct1 < 0 && crossProduct2 > 0)) {
            return orderedVertices;
        }
        orderedVertices = [x1, y1, x2, y2, x4, y4, x3, y3];
        return orderedVertices;
    }

    function _getCrossProductForRect (x1, y1, x2, y2, x3, y3) {
        var vx1 = x2 - x1;
        var vy1 = y2 - y1;
        var vx2 = x3 - x1;
        var vy2 = y3 - y1;
        var crossProduct = (vx1 * vy2) - (vy1 * vx2);
        return crossProduct
    }

    function _displayPdfNote(annotation, canvas, printElement, zoomScale){
        var box = _getCorrectedBoundingBox(annotation.boundingBox, canvas, zoomScale);
        var svgElement = "<g><g";
        if (printElement) {
            svgElement += " class = 'PdfPrintAnnotationNote'";
        }
        svgElement += ">";
        var textX = 0;
        var textY = 0;
        if (annotation.head == "None"){
            textX = box.x1 + (2 * zoomScale);
            textY = box.y1 + (annotation.fontSize * zoomScale);
        } else {
            if (annotation.boxDiffs && annotation.boxDiffs.length == 4) {
                box.x1 += (annotation.boxDiffs[0] * zoomScale);
                box.y1 += (annotation.boxDiffs[3] * zoomScale);
                box.x2 -= (annotation.boxDiffs[2] * zoomScale);
                box.y2 -= (annotation.boxDiffs[1] * zoomScale);
            }
            box = _getCorrectedLeaderLineBoundingBox (annotation, box, canvas, zoomScale);
            var path = "M" + annotation.leaderLineVertices[0]*zoomScale + " " + (parseInt(canvas.style.height) - (annotation.leaderLineVertices[1] * zoomScale));

            for (var i = 2; i < annotation.leaderLineVertices.length; i+=2){
                path += " L" + (annotation.leaderLineVertices[i] * zoomScale) + " " + (parseInt(canvas.style.height) - (annotation.leaderLineVertices[i+1] * zoomScale));
            }
            svgElement += "<path";
            if (printElement) {
                svgElement += " class = 'PdfPrintAnnotationNote'";
            }
            svgElement += " d='" + path + "' style='stroke:" + _uiColors.markup.line + ";stroke-width:" + (1.5*zoomScale) + ";fill:none'" + "marker-start='url(#" + annotation.head + "Note";
            if (printElement) {
                svgElement += "Print";
            }
            svgElement += ")' " + " /></path>";
            textX = box.x1 + (2 * zoomScale);
            textY = box.y1 + (annotation.fontSize * zoomScale);
        }
        var styleName = "";
        var j = 0;
        var found = false;
        while (!found){
            styleName = "TextStyle" + j + (printElement ? "Print" : "");
            if (canvas.innerHTML.indexOf(styleName + " { ") == -1) {
                found = true;
            } else {
                j++;
            }
        }
        var textClipPath = "M" + box.x1 + "," + box.y1 + " L" + box.x2 + "," + box.y1 + " L" + box.x2 +"," + box.y2 + " L" + box.x1 + "," + box.y2 + " L" + box.x1 + "," + box.y1;
        var style = "<style> ." + styleName + " { font: normal " + (annotation.fontSize * zoomScale) + "px " + "arial, sans-serif" + "; white-space: pre; fill: " + annotation.fontColor + ";}</style>";
        var formattedObject = _buildAdjustedNoteContent(annotation, box, canvas, printElement, zoomScale);
        var formattedContent = formattedObject.content;
        var rectHeight = Math.abs(box.y2 - box.y1);
        svgElement += "<rect id = 'PdfAnnotationElement" + annotation.id + "' class = 'PdfAnnotationElement PdfAnnoMovable PdfAnnotationElementSel";
        if (printElement) {
            svgElement += " PdfPrintAnnotationNote";
        }
        svgElement += "' data-annoid=" + annotation.id + " data-selected = 'false' x='" + box.x1 + "' y='" + box.y1 + "' width='" + (box.x2 - box.x1) + "' height='" + rectHeight + "' style='fill:" + _uiColors.markup.noteFill + ";stroke:" + _uiColors.markup.line + ";stroke-width:" + (1.5*zoomScale) + "' /></rect>";
        svgElement += "<clipPath id='textAnnoClipPath" + annotation.id + "'><path d='" + textClipPath + "' /></clipPath>";
        svgElement += "<text clip-path='url(\"#textAnnoClipPath" + annotation.id + "\")' pointer-events='none' x='" + textX + "' y='" + textY + "' class='" + styleName;
        if (printElement) {
            svgElement += " PdfPrintAnnotationNote";
        }
        svgElement += "'>" + formattedContent + "</text>";
        svgElement += "</g></g>";
        var tempHtml = canvas.innerHTML;
        canvas.innerHTML = style + tempHtml + svgElement;
    }

    function _displayPdfStamp(annotation, canvas, printElement, zoomScale){
        var stampImage = document.createElement("img");
        stampImage.id = "PdfAnnotationElement" + annotation.id;
        stampImage.className = "PdfAnnoMovable";
        if (printElement) {
            stampImage.className += " PdfPrintAnnotationStamp";
        }
        stampImage.draggable = false;
        stampImage.src = "data:image/bmp;base64," + annotation.stream;
        var box = _getCorrectedBoundingBox(annotation.vertices, canvas, zoomScale);
        stampImage.setAttribute('style',"position: absolute; left: " + box.x1 + "px; top: " + box.y1 + "px; width: " + (box.x2 - box.x1) + "px; height: " + (box.y2 - box.y1) + "px; z-index: 1");
        return stampImage;
    }

    function _createPolyPointPath(annotation, canvas, zoomScale){
        var path = "";
        for (var i = 0; i < annotation.vertices.length; i++) {
            if (i%2==0) {
                path += annotation.vertices[i] * zoomScale;
                if (i<annotation.vertices.length - 1) {
                    path += ",";
                }
            } else {
                path += (parseInt(canvas.style.height) - (annotation.vertices[i] * zoomScale));
                if (i<annotation.vertices.length - 1) {
                    path += " ";
                }
            }
        }
        return path;
    }

    function _getCorrectedLeaderLineBoundingBox (annotation, box, canvas, zoomScale){
        var x2 = annotation.leaderLineVertices[annotation.leaderLineVertices.length - 4] * zoomScale;
        var y2 = parseInt(canvas.style.height) - (annotation.leaderLineVertices[annotation.leaderLineVertices.length - 3] * zoomScale);
        var x3 = annotation.leaderLineVertices[annotation.leaderLineVertices.length - 2] * zoomScale;
        var y3 = parseInt(canvas.style.height) - (annotation.leaderLineVertices[annotation.leaderLineVertices.length - 1] * zoomScale);
        if (x2 == x3) {
            if (y2 < y3) {
                box.y1 = y3;
            } else {
                box.y2 = y3;
            }
        } else {
            if (x2 < x3) {
                box.x1 = x3;
            } else {
                box.x2 = x3;
            }
        }
        return box;
    }

    function _createTSpan(xSPos, ySPos, scaledFontSize, lineNumber, content, print) {
        var tspan = "<tspan";
        if (print)
            tspan += " class = 'PdfPrintAnnotation'";
        tspan += " x='" + xSPos + "' y='" + (ySPos + (scaledFontSize * lineNumber)) + "'>" + content + "</tspan>";
        return tspan;
    }

    function findWrapIndex(canvas, content, scaledFontSize, boundingBox, zoomScale) {
        var maxWidth = boundingBox.x2 - boundingBox.x1;
        var pxToPtConverter = (72/96);
        var calculateWidthDiv = document.createElement("div");
        calculateWidthDiv.setAttribute('style', "position: absolute; height: auto; width: auto; white-space: nowrap;");
        calculateWidthDiv.style.fontSize = scaledFontSize * pxToPtConverter + "pt";
        canvas.appendChild(calculateWidthDiv);
        calculateWidthDiv.innerHTML = content;

        if (calculateWidthDiv.clientWidth > maxWidth) {
            // Loop until it fits reducing one character at a time
            for (var i=content.length;i != 0;i--) {
                var testString = content.substring(0, i);
                calculateWidthDiv.innerHTML = testString;
                if (calculateWidthDiv.clientWidth <= maxWidth) {
                    // Break on a word if possible
                    var hasSpacePos = testString.lastIndexOf(" ");
                    if (hasSpacePos == -1) {
                        // No space - index is still i
                        canvas.removeChild(calculateWidthDiv);
                        return i;
                    } else {
                        canvas.removeChild(calculateWidthDiv);
                        return hasSpacePos;
                    }
                }
            }
        } else {
            canvas.removeChild(calculateWidthDiv);
            return -1; // no wrapping required
        }
    }

    function _buildAdjustedNoteContent(annotation, boundingBox, canvas, printElement, zoomScale){
        var scaledFontSize = (annotation.fontSize * zoomScale);
        var scaledXTextPosition = (boundingBox.x1 + (2 * zoomScale));
        var newLineChar = "\n";
        var lineFeedChar = "&#13;";

        // Split the content on new lines
        var splitContent = annotation.content.split(newLineChar);
        for (var a=0;a<splitContent.length;a++) {
            var newLines = splitContent[a].split(lineFeedChar);
            if (newLines.length > 1) {
                splitContent.splice(a,1);
                for (var s=0;s<newLines.length;s++) {
                    splitContent.splice(a+s, 0, newLines[s]);
                }
            }
        }

        for (var i=0;i<splitContent.length;++i) {
            var wi = findWrapIndex(canvas, splitContent[i], scaledFontSize, boundingBox, zoomScale);
            if (wi > 0) {
                splitContent.splice(i+1, 0, splitContent[i].substring(wi));
                if (splitContent[i+1][0] == " ") {
                    // Trim white space
                    splitContent[i+1] = splitContent[i+1].substring(1);
                }
                splitContent.splice(i, 1, splitContent[i].substring(0, wi));
            }
        }

        var tspanContent = "";
        for (var i=0;i<splitContent.length;++i) {
            tspanContent += _createTSpan(scaledXTextPosition, boundingBox.y1, scaledFontSize, i+1, splitContent[i], printElement);
        }

        var returnObject = {
            content: tspanContent,
            lineCount: splitContent.length
        };
        return returnObject;
    }

    function _sanitizeSvgText(content){
        content = content.replace(/</g,'&lt');
        content = content.replace(/>/g,'&gt');
        content = content.replace("\u0096", '&OElig;');
        content = content.replace("\u009c", '&oelig;');
        content = content.replace(/\\\(/g, '(');
        content = content.replace(/\\\)/g, ')');
        return content;
    }

    function _getNextPdfAnnotationId() {
        _pdfAnnotationId += 1;
        return _pdfAnnotationId;
    }

    function _buildPolyLineSelectorBox (vertices, canvas, idNo, movable) {
        var selectorBox = "<polygon id = 'PdfAnnotationElement" + idNo + "' class = 'PdfAnnotationElement";
        if (movable) {
            selectorBox += " PdfAnnoMovable";
        }
        selectorBox += "' data-selected='false' points = '";
        for (var i = 0; i < vertices.length; i+=2) {
            selectorBox += ((vertices[i] * __ZOOMSCALE) - 5) + "," + ((canvas.clientHeight - (vertices[i+1] * __ZOOMSCALE)) - 5) + " ";
        }
        for (var j = vertices.length-1; j > 0; j-=2) {
            selectorBox += ((vertices[j-1] * __ZOOMSCALE) + 5) + "," + ((canvas.clientHeight - (vertices[j] * __ZOOMSCALE)) + 5) + " ";
        }
        selectorBox = selectorBox.substring(0, selectorBox.length-1);
        selectorBox += "' style='fill:transparent' ></polygon>";
        return selectorBox;
    }

//PDF MOVE MARKUPS

    function _handleMovePdfAnnoEvent(e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        e.preventDefault();
        switch(e.type) {
            case "mouseenter":
                if (!_markupEdit.edit) {
                    if (e.target.dataset.selected == "false") {
                        return;
                    }
                    document.getElementById(_currentCanvasId).style.cursor = "move";
                }
                break;
            case "mousedown":
                var target;
                if (e.target.className.baseVal && (e.target.className.baseVal == "PdfMarkupAnchorBox" || e.target.className.baseVal == "PdfMarkupFreehandBox")) {
                    target = document.getElementById("PdfAnnotationElement" + e.target.dataset.annoid);
                } else {
                    target = e.target;
                }
                if (!_markupEdit.edit && _markupMode.selectedAnnotations.length > 0 && _markupMode.selectedAnnotations.indexOf(target) > -1) {
                    _markupEdit.drag.x = e.pageX;
                    _markupEdit.drag.y = e.pageY;
                    _markupEdit.move = true;
                    _markupEdit.drag.state = true;
                    _markupEdit.drag.target = target;
                }
                break;
            case "mousemove":
                if (_markupEdit.move && !_markupEdit.edit && _markupEdit.drag.state && _markupEdit.drag.target) {
                    if (!_markupEdit.preventDeselect) {
                        _markupEdit.preventDeselect = true;
                    }
                    if (!_markupEdit.viewDirty) {
                        _markupEdit.viewDirty = true;
                        _pushActionToMarkupHistory(_undoPresets.move, _markupMode.selectedAnnotations.map(function(x){ return x.dataset.annoid; }), _markupMode.selectedAnnotations.map(function(y) { return _getParsedAnnotation(y); }));
                    }
                    _movePdfAnnos(e, _markupEdit.drag);
                }
                break;
            case "mouseleave":
                document.getElementById(_currentCanvasId).style.cursor = "auto";
                break;
            case "mouseup":
                if (_markupEdit.move && !_markupEdit.edit && _markupEdit.drag.state && _markupEdit.drag.target) {
                    _markupEdit.move = false;
                    _markupEdit.preventDeselect = false;
                    _markupEdit.drag.state = false;
                    _markupEdit.drag.target = null;
                    if (_markupEdit.viewDirty) {
                        _markupEdit.viewDirty = false;
                        _markupObserver.set("annoSetEdited");
                    }
                }
                break;
            default:
                return;
        }
    }

    function _reorderSVGElement(target, drag, bringToFront) {
        var parent = target.parentNode;
        var redrawNode = target;
        while (parent.tagName != "svg" && parent.parentNode) {
            redrawNode = parent;
            parent = parent.parentNode;
        }
        if (bringToFront) {
            drag.index = -1;
            for (var i = 0; i < parent.childNodes.length; i++) {
                if (parent.childNodes[i] == redrawNode) {
                    drag.index = i;
                    break;
                }
            }
            if (drag.index < 0) {
                return;
            }
            parent.appendChild(redrawNode);
        } else {
            if(drag.index < 0) {
                return;
            }
            parent.insertBefore(redrawNode, parent.childNodes[drag.index]);
            drag.index = -1;
        }
    }

    function _movePdfAnnos(e, drag) {
        e.preventDefault();
        var deltaX, deltaY;
        var pageRotation = _checkPageRotation();
        if (pageRotation == 0) {
            deltaX = e.pageX - drag.x;
            deltaY = e.pageY - drag.y;
        } else if (pageRotation == 1) {
            deltaY = -1 * (e.pageX - drag.x);
            deltaX = e.pageY - drag.y;
        } else if (pageRotation == 2) {
            deltaX = -1 * (e.pageX - drag.x);
            deltaY = -1 * (e.pageY - drag.y);
        } else if (pageRotation == 3) {
            deltaY = e.pageX - drag.x;
            deltaX =  -1 * (e.pageY - drag.y);
        } else {
           return;
        }
        for (var i = 0; i < _markupMode.selectedAnnotations.length; i++) {
            var anno = _markupMode.selectedAnnotations[i];
            var parsedAnno = _getParsedAnnotation(anno);
            switch (parsedAnno.type) {
                case _markupTypes.leaderLine :
                    _moveLeaderLineAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                case _markupTypes.polyline :
                    _movePolyLineAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                case _markupTypes.rectangle :
                case _markupTypes.rectangleFilled :
                    _moveRectangleAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                case _markupTypes.ellipse :
                case _markupTypes.ellipseFilled :
                    _moveCircleAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                case _markupTypes.polygon :
                case _markupTypes.polygonFilled :
                    _movePolygonAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                case _markupTypes.freehand :
                    _moveFreehandAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                case _markupTypes.note :
                case _markupTypes.noteLeader :
                    _moveNoteAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                case _markupTypes.stamp :
                    _moveStampAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                default:
                    break;
            }
        }
        drag.x = e.pageX;
        drag.y = e.pageY;

    }

    function _moveRectangleAnno(deltaX, deltaY, parsedAnno, target) {
        var oldX1 = parseFloat(target.attributes.x.nodeValue);
        var oldY1 = parseFloat(target.attributes.y.nodeValue);
        var oldX2 = oldX1 + parseFloat(target.attributes.width.nodeValue);
        var oldY2 = oldY1 + parseFloat(target.attributes.height.nodeValue);
        var parentCanvas = target.parentNode.parentNode.parentNode;
        if ((deltaX > 0 || oldX1 + deltaX >= 0) &&
            (deltaY > 0 || oldY1 + deltaY >= 0) &&
            (deltaX <= 0 || oldX2 + deltaX <= parseFloat(parentCanvas.style.width)) &&
            (deltaY <= 0 || oldY2 + deltaY <= parseFloat(parentCanvas.style.height))) {
                target.setAttribute("x", oldX1 + deltaX);
                target.setAttribute("y", oldY1 + deltaY);
                _moveRectangleAnchorPoints(deltaX, deltaY, target);
                parsedAnno.vertices[0] += (deltaX / __ZOOMSCALE);
                parsedAnno.vertices[1] -= (deltaY / __ZOOMSCALE);
                parsedAnno.vertices[2] += (deltaX / __ZOOMSCALE);
                parsedAnno.vertices[3] -= (deltaY / __ZOOMSCALE);
        }
    }

    /**
    * Move the anchor points of a rectangle markup
    * @param {deltaX} float The distance the markup has moved by on the X axis
    * @param {deltaY} float The distance the markup has moved by on the Y axis
    * @param {target} DOM element The target element of the move event (the markup being moved)
    * @private
    * @memberof ThingView
    **/
    function _moveRectangleAnchorPoints (deltaX, deltaY, target) {
        //anchorGroup is the second child node of the group containing the markup and it's group of anchors / bounding box
        var anchorGroup = target.parentNode.childNodes[1];
        for (var i = 0; i < anchorGroup.childNodes.length; i++) {
            anchorGroup.childNodes[i].setAttribute("x", parseInt(anchorGroup.childNodes[i].attributes.x.nodeValue) + deltaX);
            anchorGroup.childNodes[i].setAttribute("y", parseInt(anchorGroup.childNodes[i].attributes.y.nodeValue) + deltaY);
        }
    }

    function _moveCircleAnno(deltaX, deltaY, parsedAnno, target) {
        var oldCX = parseFloat(target.attributes.cx.nodeValue);
        var oldCY = parseFloat(target.attributes.cy.nodeValue);
        var oldRX = parseFloat(target.attributes.rx.nodeValue);
        var oldRY = parseFloat(target.attributes.ry.nodeValue);
        var oldX1 = oldCX - oldRX;
        var oldY1 = oldCY - oldRY;
        var oldX2 = oldCX + oldRX;
        var oldY2 = oldCY + oldRY;
        var parentCanvas = target.parentNode.parentNode.parentNode;
        if ((deltaX > 0 || oldX1 + deltaX >= 0) &&
            (deltaY > 0 || oldY1 + deltaY >= 0) &&
            (deltaX <= 0 || oldX2 + deltaX <= parseFloat(parentCanvas.style.width)) &&
            (deltaY <= 0 || oldY2 + deltaY <= parseFloat(parentCanvas.style.height))) {
                target.setAttribute("cx", parseInt(target.attributes.cx.nodeValue) + deltaX);
                target.setAttribute("cy", parseInt(target.attributes.cy.nodeValue) + deltaY);
                _moveRectangleAnchorPoints(deltaX, deltaY, target);
                parsedAnno.vertices[0] += (deltaX / __ZOOMSCALE);
                parsedAnno.vertices[1] -= (deltaY / __ZOOMSCALE);
                parsedAnno.vertices[2] += (deltaX / __ZOOMSCALE);
                parsedAnno.vertices[3] -= (deltaY / __ZOOMSCALE);
        }
    }

    function _movePolygonAnno(deltaX, deltaY, parsedAnno, target) {
        var points = target.attributes.points.nodeValue.split(" ");
        var newPoints = "";
        for (var i = 0; i < points.length; i++) {
            points[i] = points[i].split(",");
            points[i][0] = parseInt(points[i][0]) + deltaX;
            points[i][1] = parseInt(points[i][1]) + deltaY;
            newPoints += points[i][0] + "," + points[i][1] + " ";
        }
        newPoints = newPoints.substring(0, newPoints.length-1);
        target.setAttribute("points", newPoints);
        for (var j = 0; j < parsedAnno.vertices.length-2; j+=2) {
            parsedAnno.vertices[j] += deltaX;
            parsedAnno.vertices[j+1] += deltaY;
        }
    }

    function _moveNoteAnno(deltaX, deltaY, parsedAnno, target) {
        var deltaXZ = deltaX / __ZOOMSCALE;
        var deltaYZ = deltaY / __ZOOMSCALE;
        var bx1 = Math.min(parsedAnno.boundingBox[0], parsedAnno.boundingBox[2]);
        var by1 = Math.max(parsedAnno.boundingBox[1], parsedAnno.boundingBox[3]);
        var bx2 = Math.max(parsedAnno.boundingBox[0], parsedAnno.boundingBox[2]);
        var by2 = Math.min(parsedAnno.boundingBox[1], parsedAnno.boundingBox[3]);
        var pageCanvas = target.parentNode.parentNode.parentNode.parentNode;
        var pageWidthZ = parseFloat(pageCanvas.style.width) / __ZOOMSCALE;
        var pageHeightZ = parseFloat(pageCanvas.style.height) / __ZOOMSCALE;
        if ((deltaXZ > 0 || bx1 + deltaXZ > 0) &&
            (deltaYZ > 0 || by1 - deltaYZ < pageHeightZ) &&
            (deltaXZ < 0 || bx2 + deltaXZ < pageWidthZ) &&
            (deltaYZ < 0 || by2 - deltaYZ > 0)) {
                var parentGroup = target.parentNode;
                for (var i = 0; i < parentGroup.childNodes.length; i++) {
                    var node = parentGroup.childNodes[i];
                    switch (node.tagName) {
                        case "rect":
                            node.setAttribute("x", parseInt(node.attributes.x.nodeValue) + deltaX);
                            node.setAttribute("y", parseInt(node.attributes.y.nodeValue) + deltaY);
                            break;
                        case "text" :
                            node.setAttribute("x", parseInt(node.attributes.x.nodeValue) + deltaX);
                            node.setAttribute("y", parseInt(node.attributes.y.nodeValue) + deltaY);
                            for (var j = 0; j < node.childNodes.length; j++) {
                                if (node.childNodes[j].tagName == "tspan") {
                                    node.childNodes[j].setAttribute("x", parseInt(node.childNodes[j].attributes.x.nodeValue) + deltaX);
                                    node.childNodes[j].setAttribute("y", parseInt(node.childNodes[j].attributes.y.nodeValue) + deltaY);
                                }
                            }
                            break;
                        case "path" :
                            var newPath = "";
                            var pathArray = node.attributes.d.nodeValue.split(" L");
                            for (var k = 0; k < pathArray.length; k++) {
                                if(pathArray[k][0].indexOf("M") != -1) {
                                    pathArray[k] = pathArray[k].replace("M", "");
                                }
                                pathArray[k] = pathArray[k].trim().split(" ");
                                pathArray[k][0] = parseInt(pathArray[k][0].trim()) + deltaX;
                                pathArray[k][1] = parseInt(pathArray[k][1].trim()) + deltaY;
                                newPath += "L" + pathArray[k][0] + " " + pathArray[k][1] + " ";
                            }
                            newPath = "M" + newPath.substring(1, newPath.length-1);
                            node.setAttribute("d", newPath);
                            break;
                        default:
                            break;
                    }
                }
                _moveRectangleAnchorPoints(deltaX, deltaY, target.parentNode);
                for (var l = 0; l < parsedAnno.boundingBox.length-1; l+=2) {
                    parsedAnno.boundingBox[l] += deltaXZ;
                    parsedAnno.boundingBox[l+1] -= deltaYZ;
                }
                for (var m = 0; m < parsedAnno.leaderLineVertices.length-1; m+=2) {
                    parsedAnno.leaderLineVertices[m] += deltaXZ;
                    parsedAnno.leaderLineVertices[m+1] -= deltaYZ;
                }
                var textClipPath = document.getElementById("textAnnoClipPath" + parsedAnno.id).firstChild;
                var x1 = parseInt(target.attributes.x.nodeValue);
                var y1 = parseInt(target.attributes.y.nodeValue);
                var x2 = parseInt(target.attributes.x.nodeValue) + parseInt(target.attributes.width.nodeValue);
                var y2 = parseInt(target.attributes.y.nodeValue) + parseInt(target.attributes.height.nodeValue);
                var newTextClipPath = "M" + x1 + "," + y1 +
                                     " L" + x2 + "," + y1 +
                                     " L" + x2 + "," + y2 +
                                     " L" + x1 + "," + y2 +
                                     " L" + x1 + "," + y1;
                textClipPath.setAttribute("d", newTextClipPath);
        }
    }

    function _moveStampAnno (deltaX, deltaY, parsedAnno, target) {
        target.style.left =  parseInt(target.style.left) + deltaX + "px";
        target.style.top = parseInt(target.style.top) + deltaY + "px";
        parsedAnno.vertices[0] += deltaX;
        parsedAnno.vertices[1] += deltaY;
        parsedAnno.vertices[2] += deltaX;
        parsedAnno.vertices[3] += deltaY;
    }

    function _moveLeaderLineAnno(deltaX, deltaY, parsedAnno, target) {
        var deltaXZ = deltaX / __ZOOMSCALE;
        var deltaYZ = deltaY / __ZOOMSCALE;
        var bx1 = Math.min(parsedAnno.boundingBox[0], parsedAnno.boundingBox[2]);
        var by1 = Math.max(parsedAnno.boundingBox[1], parsedAnno.boundingBox[3]);
        var bx2 = Math.max(parsedAnno.boundingBox[0], parsedAnno.boundingBox[2]);
        var by2 = Math.min(parsedAnno.boundingBox[1], parsedAnno.boundingBox[3]);
        var parentCanvas = target.parentNode.parentNode.parentNode;
        var pageWidthZ = parseFloat(parentCanvas.style.width) / __ZOOMSCALE;
        var pageHeightZ = parseFloat(parentCanvas.style.height) / __ZOOMSCALE;
        if ((deltaXZ > 0 || bx1 + deltaXZ > 0) &&
            (deltaYZ > 0 || by1 - deltaYZ < pageHeightZ) &&
            (deltaXZ < 0 || bx2 + deltaXZ < pageWidthZ) &&
            (deltaYZ < 0 || by2 - deltaYZ > 0)) {
                target.setAttribute('x1', parseFloat(target.attributes.x1.nodeValue) + deltaX);
                target.setAttribute('x2', parseFloat(target.attributes.x2.nodeValue) + deltaX);
                target.setAttribute('y1', parseFloat(target.attributes.y1.nodeValue) + deltaY);
                target.setAttribute('y2', parseFloat(target.attributes.y2.nodeValue) + deltaY);
                _moveLeaderLineAnchorPoints(deltaX, deltaY, target);
                for (var l = 0; l < parsedAnno.boundingBox.length-1; l+=2) {
                    parsedAnno.boundingBox[l] += deltaXZ;
                    parsedAnno.boundingBox[l+1] -= deltaYZ;
                }
                for (var m = 0; m < parsedAnno.vertices.length-1; m+=2) {
                    parsedAnno.vertices[m] += deltaXZ;
                    parsedAnno.vertices[m+1] -= deltaYZ;
                }
        }
    }

    /**
    * Move the anchor points of a leader line markup
    * @param {deltaX} float The distance the markup has moved by on the X axis
    * @param {deltaY} float The distance the markup has moved by on the Y axis
    * @param {target} DOM element The target element of the move event (the markup being moved)
    * @private
    * @memberof ThingView
    **/
    function _moveLeaderLineAnchorPoints (deltaX, deltaY, target) {
        var anchorGroup = target.parentNode.childNodes[1];
        for (var i = 0; i < anchorGroup.childNodes.length; i++) {
            var childNode = anchorGroup.childNodes[i]
            if (childNode.tagName == "rect") {
                childNode.setAttribute("x", parseInt(childNode.attributes.x.nodeValue) + deltaX);
                childNode.setAttribute("y", parseInt(childNode.attributes.y.nodeValue) + deltaY);
            } else if (childNode.tagName == "polygon") {
                var newPoints = "";
                for (var j = 0; j < childNode.points.length; j++) {
                    newPoints += (childNode.points.getItem(j).x + deltaX) + "," + (childNode.points.getItem(j).y + deltaY) + " ";
                }
                childNode.setAttribute("points", newPoints);
            }
        }
    }

    function _movePolyLineAnno (deltaX, deltaY, parsedAnno, target) {
        for (var i = 0; i < target.parentNode.childNodes.length; i++) {
            var node = target.parentNode.childNodes[i];
            switch (node.tagName) {
                case "polyline" :
                case "polygon" :
                    _updateNodePointsArray(node, deltaX, deltaY);
                    break;
                default :
                    break;
            }
        }
        for (var l = 0; l < parsedAnno.boundingBox.length-1; l+=2) {
            parsedAnno.boundingBox[l] += deltaX;
            parsedAnno.boundingBox[l+1] += deltaY;
        }
        for (var m = 0; m < parsedAnno.vertices.length-1; m+=2) {
            parsedAnno.vertices[m] += deltaX;
            parsedAnno.vertices[m+1] += deltaY;
        }
    }

    function _moveFreehandAnno(deltaX, deltaY, parsedAnno, target) {
        var deltaXZ = deltaX / __ZOOMSCALE;
        var deltaYZ = deltaY / __ZOOMSCALE;
        var bx1 = Math.min(parsedAnno.boundingBox[0], parsedAnno.boundingBox[2]);
        var by1 = Math.max(parsedAnno.boundingBox[1], parsedAnno.boundingBox[3]);
        var bx2 = Math.max(parsedAnno.boundingBox[0], parsedAnno.boundingBox[2]);
        var by2 = Math.min(parsedAnno.boundingBox[1], parsedAnno.boundingBox[3]);
        var pageCanvas = target.parentNode.parentNode.parentNode.parentNode;
        var pageWidthZ = parseFloat(pageCanvas.style.width) / __ZOOMSCALE;
        var pageHeightZ = parseFloat(pageCanvas.style.height) / __ZOOMSCALE;
        if ((deltaXZ > 0 || bx1 + deltaXZ > 0) &&
            (deltaYZ > 0 || by1 - deltaYZ < pageHeightZ) &&
            (deltaXZ < 0 || bx2 + deltaXZ < pageWidthZ) &&
            (deltaYZ < 0 || by2 - deltaYZ > 0)) {
                for (var i = 0; i < target.parentNode.childNodes.length; i++) {
                    var node = target.parentNode.childNodes[i];
                    if (node.attributes.d) {
                        var coords = node.attributes.d.nodeValue.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g);
                        var newPath = "";
                        for (var k=0;k<coords.length/2;k++) {
                            coords[k*2] = parseFloat(coords[k*2]) + deltaX;
                            coords[k*2+1] = parseFloat(coords[k*2+1]) + deltaY;

                            if (k == 0) {
                                newPath += "M" + coords[k*2] + " " + coords[k*2+1];
                            } else {
                                if (k%2 == 1) newPath += "Q";
                                newPath += coords[k*2] + " " + coords[k*2+1] + " ";
                            }
                        }
                        node.setAttribute("d", newPath);
                    } else {
                        if (node.attributes.id && node.attributes.id.nodeValue.indexOf("PdfMarkupAnchorGroup") != -1) {
                            for (var j = 0; j < node.childNodes.length; j++) {
                                node.childNodes[j].setAttribute("x", parseFloat(node.childNodes[j].attributes.x.nodeValue) + deltaX);
                                node.childNodes[j].setAttribute("y", parseFloat(node.childNodes[j].attributes.y.nodeValue) + deltaY);

                                if (node.childNodes[j].attributes.id.nodeValue.indexOf("PdfMarkupAnchorBox") != -1) {
                                    node.childNodes[j].setAttribute("orgx", parseFloat(node.childNodes[j].attributes.orgx.nodeValue) + deltaX);
                                    node.childNodes[j].setAttribute("orgy", parseFloat(node.childNodes[j].attributes.orgy.nodeValue) + deltaY);
                                }
                            }
                        }
                    }
                }
                for (var l = 0; l <= parsedAnno.boundingBox.length-2; l+=2) {
                    parsedAnno.boundingBox[l] += deltaXZ;
                    parsedAnno.boundingBox[l+1] -= (deltaY / __ZOOMSCALE);
                }
                for (var m = 0; m <= parsedAnno.vertices.length-2; m+=2) {
                    parsedAnno.vertices[m] += deltaXZ;
                    parsedAnno.vertices[m+1] -= deltaYZ;
                }
        }
    }

    function _updateNodePointsArray (node, deltaX, deltaY) {
        var newPoints = "";
        var pointsArray = node.attributes.points.nodeValue.split(" ");
        for (var j = 0; j < pointsArray.length; j++) {
            pointsArray[j] = pointsArray[j].split(",");
            pointsArray[j][0] = parseInt(pointsArray[j][0]) + deltaX;
            pointsArray[j][1] = parseInt(pointsArray[j][1]) + deltaY;
            newPoints += pointsArray[j][0] + "," + pointsArray[j][1] + " ";
        }
        node.setAttribute("points", newPoints.substring(0,newPoints.length-1));
    }

    function _getParsedAnnotation (markup) {
        var annoId = -1;
        if (markup.id.length == 0) {
            if (markup.parentNode.id.length > 0) {
                annoId = parseInt(markup.parentNode.id.substring(20));
            } else if (markup.childNodes[0].id.length > 0) {
                annoId = parseInt(markup.childNodes[0].id.substring(20));
            } else if (markup.childNodes[1].id.length > 0) {
                annoId = parseInt(markup.childNodes[1].id.substring(20));
            }
        } else {
            annoId = parseInt(markup.id.substring(20));
        }
        if(annoId == null || annoId < 0) {
            return;
        }
        return _pdfParsedAnnotationSet[annoId];
    }

//PDF DELETE AND EDIT MARKUPS

    function _handleMarkupSelectionCheck (e, drag) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if (e.type == "mousedown") {
            var boundingBox = e.target.parentNode.getBoundingClientRect();
            drag.x = e.clientX - boundingBox.left;
            drag.y = e.clientY - boundingBox.top;
        }
        if (e.type == "mouseup") {
            var boundingBox = e.target.parentNode.getBoundingClientRect();
            var x = e.clientX - boundingBox.left;
            var y = e.clientY - boundingBox.top;
            if (x != drag.x || y != drag.y) {
                drag.x = 0;
                drag.y = 0;
                return;
            }
            drag.x = 0;
            drag.y = 0;
            var className = "PdfPageDisplayTextLayer";
            var pageNo = parseInt(e.target.id.substring(className.length));
            var annoCanvas = document.getElementById("PdfAnnotationCanvas" + (pageNo-1));
            if (!annoCanvas) {
                return;
            }
            var pageRotation = _checkPageRotation();
            if (pageRotation > 0) {
                var annoCanvasHeight = parseInt(annoCanvas.clientHeight);
                var annoCanvasWidth = parseInt(annoCanvas.clientWidth);
                if (pageRotation == 1) {
                    var xTemp = annoCanvasHeight - x;
                    x = y;
                    y = xTemp;
                } else if (pageRotation == 2) {
                    x = annoCanvasWidth - x;
                    y = annoCanvasHeight - y;
                } else if (pageRotation == 3) {
                    var yTemp = annoCanvasWidth - y;
                    y = x;
                    x = yTemp;
                }
            }
            for (var i=0;i<_pageAnnoSetList[pageNo].length;i++) {
                var parsedAnno = _pdfParsedAnnotationSet[_pageAnnoSetList[pageNo][i]];
                var selectedFound = false;
                switch (parsedAnno.type) {
                    case _markupTypes.leaderLine:
                        if (_getClickInsideLeaderLineBox(x, y, parsedAnno.vertices, parseInt(annoCanvas.clientHeight))) {
                            selectedFound = true;
                        }
                        break;
                    case _markupTypes.rectangle:
                    case _markupTypes.ellipse:
                    case _markupTypes.rectangleFilled:
                    case _markupTypes.ellipseFilled:
                    case _markupTypes.note:
                        var vertices;
                        if (parsedAnno.boundingBox) {
                            vertices = _getCorrectedBoundingBox(parsedAnno.boundingBox, annoCanvas, __ZOOMSCALE);
                        } else if (parsedAnno.vertices) {
                            vertices = _getCorrectedBoundingBox(parsedAnno.vertices, annoCanvas, __ZOOMSCALE);
                        } else {
                            continue;
                        }
                        if ((x >= vertices.x1 && x <= vertices.x2) && (y >= vertices.y1 && y <= vertices.y2)) {
                            selectedFound = true;
                        }
                        break;
                    case _markupTypes.freehand:
                        if (_getClickInsideFreehand(x, y, parsedAnno.vertices, parseInt(annoCanvas.clientHeight))) {
                            selectedFound = true;
                        }
                        break;
                    case _markupTypes.noteLeader:
                        var vertices = _getCorrectedBoundingBox(parsedAnno.boundingBox, annoCanvas, __ZOOMSCALE);
                        if ((_getClickInsidePolyLineBox(x, y, parsedAnno.leaderLineVertices, parseInt(annoCanvas.clientHeight))) ||
                             ((x >= vertices.x1 && x <= vertices.x2) && (y >= vertices.y1 && y <= vertices.y2))) {
                                selectedFound = true;
                        }
                        break;
                    case _markupTypes.textHighlight:
                    case _markupTypes.textStrikethrough:
                    case _markupTypes.textUnderline:
                        if (_getClickInsideHighlight(x, y, parsedAnno.vertices, parseInt(annoCanvas.clientHeight))) {
                            selectedFound = true;
                        }
                        break;
                    default:
                        continue;
                }

                if (selectedFound) {
                    e.stopPropagation();
                    var annoElement = document.getElementById("PdfAnnotationElement" + parsedAnno.id);
                    if (!annoElement) {
                        return;
                    }
                    var proxyEvent = new Event('mouseup');
                    annoElement.dispatchEvent(proxyEvent);
                    return;
                }
            }
        }
    }

    function _getClickInsideLeaderLineBox (clickX, clickY, box, pageHeight) {
        var newBox;
        if ((box[0] < box[2] && box[1] > box[3]) || (box[0] > box[2] && box[1] < box[3])) {
            newBox = [[(box[0] * __ZOOMSCALE) + _uiSizes.anchor.boxMargin, (pageHeight - (box[1] * __ZOOMSCALE)) - _uiSizes.anchor.boxMargin],
                      [(box[2] * __ZOOMSCALE) + _uiSizes.anchor.boxMargin, (pageHeight - (box[3] * __ZOOMSCALE)) - _uiSizes.anchor.boxMargin],
                      [(box[2] * __ZOOMSCALE) - _uiSizes.anchor.boxMargin, (pageHeight - (box[3] * __ZOOMSCALE)) + _uiSizes.anchor.boxMargin],
                      [(box[0] * __ZOOMSCALE) - _uiSizes.anchor.boxMargin, (pageHeight - (box[1] * __ZOOMSCALE)) + _uiSizes.anchor.boxMargin]];
        } else {
            newBox = [[(box[0] * __ZOOMSCALE) - _uiSizes.anchor.boxMargin, (pageHeight - (box[1] * __ZOOMSCALE)) - _uiSizes.anchor.boxMargin],
                      [(box[2] * __ZOOMSCALE) - _uiSizes.anchor.boxMargin, (pageHeight - (box[3] * __ZOOMSCALE)) - _uiSizes.anchor.boxMargin],
                      [(box[2] * __ZOOMSCALE) + _uiSizes.anchor.boxMargin, (pageHeight - (box[3] * __ZOOMSCALE)) + _uiSizes.anchor.boxMargin],
                      [(box[0] * __ZOOMSCALE) + _uiSizes.anchor.boxMargin, (pageHeight - (box[1] * __ZOOMSCALE)) + _uiSizes.anchor.boxMargin]];
        }

        if ((clickX < newBox[0][0] && clickX < newBox[1][0] && clickX < newBox[2][0] && clickX < newBox[3][0]) ||
            (clickY < newBox[0][1] && clickY < newBox[1][1] && clickY < newBox[2][1] && clickY < newBox[3][1]) ||
            (clickX > newBox[0][0] && clickX > newBox[1][0] && clickX > newBox[2][0] && clickX > newBox[3][0]) ||
            (clickY > newBox[0][1] && clickY > newBox[1][1] && clickY > newBox[2][1] && clickY > newBox[3][1])) {
                return false;
        }


        var crossProduct1 = _getCrossProduct(newBox[0][0], newBox[1][0], newBox[0][1], newBox[1][1], clickX, clickY);
        var crossProduct2 = _getCrossProduct(newBox[2][0], newBox[3][0], newBox[2][1], newBox[3][1], clickX, clickY);
        var crossProduct3 = _getCrossProduct(newBox[1][0], newBox[2][0], newBox[1][1], newBox[2][1], clickX, clickY);
        var crossProduct4 = _getCrossProduct(newBox[3][0], newBox[0][0], newBox[3][1], newBox[0][1], clickX, clickY);

        if ((crossProduct1 > 0 && crossProduct2 > 0 && crossProduct3 > 0 && crossProduct4 > 0) ||
            (crossProduct1 < 0 && crossProduct2 < 0 && crossProduct3 < 0 && crossProduct4 < 0)) {
            return true;
        }
        return false;
    }

    function _getClickInsidePolyLineBox(clickX, clickY, box, pageHeight) {
        for (var i = 0; i < box.length-3; i+=2) {
            var sectionBox = [box[i], box[i+1], box[i+2], box[i+3]];
            var found = _getClickInsideLeaderLineBox(clickX, clickY, sectionBox, pageHeight);
            if (found) {
                return true;
            }
        }
        return false;
    }

    function _getClickInsideFreehand (clickX, clickY, vertices, pageHeight) {
        for (var i = 0; i < vertices.length - 5; i+= 4) {
            var x1 = vertices[i] * __ZOOMSCALE;
            var y1 = pageHeight - (vertices[i+1] * __ZOOMSCALE);
            var x2 = vertices[i+4] * __ZOOMSCALE;
            var y2 = pageHeight - (vertices[i+5] * __ZOOMSCALE);
            var difference = 5 * __ZOOMSCALE;
            if ((clickX > x1 - difference && clickX < x2 + difference) ||
                (clickX < x1 + difference && clickX > x2 - difference)) {
                    if ((clickY > y1 - difference && clickY < y2 + difference) ||
                        (clickY < y1 + difference && clickY > y2 - difference)) {
                            return true;
                    }
            }
        }
        return false;
    }

    function _getClickInsideHighlight (clickX, clickY, vertices, pageHeight) {
        for (var i = 0; i < vertices.length - 7; i+= 8) {
            var x1 = Math.min(vertices[i], vertices[i+2], vertices[i+4], vertices[i+6]) * __ZOOMSCALE;
            var y1 = pageHeight - (Math.max(vertices[i+1], vertices[i+3], vertices[i+5], vertices[i+7]) * __ZOOMSCALE);
            var x2 = Math.max(vertices[i], vertices[i+2], vertices[i+4], vertices[i+6]) * __ZOOMSCALE;
            var y2 = pageHeight - (Math.min(vertices[i+1], vertices[i+3], vertices[i+5], vertices[i+7]) * __ZOOMSCALE);
            if ((clickX > x1 && clickX < x2) ||
                (clickX < x1 && clickX > x2)) {
                    if ((clickY > y1 && clickY < y2) ||
                        (clickY < y1 && clickY > y2)) {
                            return true;
                    }
            }
        }
        return false;
    }

    function _getCrossProduct (x1, x2, y1, y2, clickX, clickY) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var cx = x2 - clickX;
        var cy = y2 - clickY;
        var crossProduct = (dx * cy) - (dy * cx);
        return crossProduct
    }

    function _handleSelectPdfAnnoEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if (!_markupEdit.preventDeselect) {
            e.preventDefault();
            if (!e.ctrlKey && _markupMode.selectedAnnotations.length > 0) {
                var selectedLength = _markupMode.selectedAnnotations.length;
                for (var i = 0; i < selectedLength; i++) {
                    _setPdfAnnotationSelect(_markupMode.selectedAnnotations[0], false);
                }
            }
            if (e.target.dataset.selected == "false") {
                _selectPdfAnnotation(e.target);
            } else {
                _deselectPdfAnnotation(e.target);
            }
        }
    }

    function getMarkupBBoxInDocument(anno, canvas) {
        var box = _getCorrectedBoundingBox(anno.boundingBox || anno.vertices, canvas, __ZOOMSCALE);
        return {
            x: (box.x1 + box.x2) / 2 + canvas.parentNode.offsetLeft,
            y: (box.y1 + box.y2) / 2 + canvas.parentNode.offsetTop
        };
    }

    function _handleSelectPdfAnnoAPI (idNo, selected) {
        var annotation = document.getElementById("PdfAnnotationElement" + idNo);
        if (annotation) {
            if (selected) {
                if (_markupMode.selectedAnnotations.length == 0) {
                    var anno = _pdfParsedAnnotationSet[parseInt(idNo)];
                    if (anno) {
                        var canvas = document.getElementById("PdfAnnotationCanvas" + anno.pageNo);
                        if (canvas) {
                            var box = getMarkupBBoxInDocument(anno, canvas);
                            var canvasWrapper = document.getElementById(_currentCanvasId);
                            canvasWrapper.parentNode.scrollLeft = Math.max(box.x - canvasWrapper.parentNode.clientWidth / 2, 0);
                            canvasWrapper.parentNode.scrollTop = Math.max(box.y - canvasWrapper.parentNode.clientHeight / 2 + _marginSize, 0);
                            _updateDocumentToolbarPageDisplay();
                            _selectPdfAnnotation(annotation);
                        }
                    }
                } else {
                    _selectPdfAnnotation(annotation);
                }
            } else {
                _deselectPdfAnnotation(annotation);
            }
        } else {
            if (selected) {
                var annot = _pdfParsedAnnotationSet[parseInt(idNo)];
                if (annot) {
                    if (_markupMode.selectedAnnotations.length == 0) {
                        var pageNo = annot.pageNo+1;
                        var pageWrapper = document.getElementById("PdfPageDisplayWrapper" + pageNo);
                        if (pageWrapper) {
                            var bbox = getMarkupBBoxInDocument(annot, pageWrapper);
                            var dest = { 1: "", 2: bbox.x, 3: bbox.y };
                            gotoBookmark(pageNo, dest, function(success) {
                                if (success) {
                                    var annotation = document.getElementById("PdfAnnotationElement" + idNo);
                                    if (annotation) {
                                        _selectPdfAnnotation(annotation);
                                    } else {
                                        _markupMode.hiddenSelectedAnnotations.push(idNo);
                                    }
                                }
                            });
                        }
                    }
                }
            } else {
                if (_markupMode.hiddenSelectedAnnotations.indexOf(idNo) > -1) {
                    _markupMode.hiddenSelectedAnnotations.splice(_markupMode.hiddenSelectedAnnotations.indexOf(idNo), 1);
                }
            }
        }
    }

    function _checkDeselectPdfAnnotation (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if ((_markupMode.selectedAnnotations.length > 0 && _markupMode.selectedAnnotations.indexOf(e.target) == -1) &&
            (e.target.className && e.target.className != "PdfMarkupNoteEditor") &&
            (!(e.target.className.baseVal && (e.target.className.baseVal.indexOf("PdfAnnotationElementSel") > -1 ||
                                              e.target.className.baseVal.indexOf("PdfMarkupAnchorBox") > -1 ||
                                              e.target.className.baseVal.indexOf("PdfMarkupFreehandBox") > -1)))) {
                _clearPdfAnnoSelection();
        }
    }

    function _clearPdfAnnoSelection () {
        var selectedLength = _markupMode.selectedAnnotations.length;
        for (var i = 0; i < selectedLength; i++) {
            _deselectPdfAnnotation(_markupMode.selectedAnnotations[0]);
        }
    }

    function _selectPdfAnnotation (annotation) {
        if (annotation && annotation.className.baseVal &&  annotation.className.baseVal.indexOf("PdfAnnotationElementSel") > -1) {
            var pageNo = _pdfParsedAnnotationSet[parseInt(annotation.dataset.annoid)].pageNo+1;
            var textLayer = document.getElementById("PdfPageDisplayTextLayer" + pageNo);
            if (textLayer) {
                textLayer.style.zIndex = -1;
            }
            if (annotation.dataset.selected == "false" && (_markupMode.selectedAnnotations.length == 0 || _markupMode.selectedAnnotations.indexOf(annotation) == -1)){
                _setPdfAnnotationSelect(annotation, true);
            } else if (annotation.parentNode.dataset.selected == "false" && (_markupMode.selectedAnnotations.length == 0 || _markupMode.selectedAnnotations.indexOf(annotation.parentNode) == -1)){
                _setPdfAnnotationSelect(annotation.parentNode, true);
            }
        }
    }

    function _deselectPdfAnnotation (annotation) {
        if (annotation &&
            annotation.className.baseVal &&
            annotation.className.baseVal.indexOf("PdfAnnotationElementSel") > -1 &&
            annotation.dataset.selected == "true") {
                _setPdfAnnotationSelect(annotation, false);
                var pageNo = _pdfParsedAnnotationSet[parseInt(annotation.dataset.annoid)].pageNo + 1;
                var selectedPageNos = _markupMode.selectedAnnotations.map(function(x) { return _pdfParsedAnnotationSet[parseInt(x.dataset.annoid)].pageNo; });
                if (selectedPageNos.indexOf(pageNo-1) == -1) {
                    var textLayer = document.getElementById("PdfPageDisplayTextLayer" + pageNo);
                    if (textLayer) {
                        textLayer.style.zIndex = 3;
                    }
                }
        }
    }

    function _setPdfAnnotationSelect(markup, selected) {
        if (!markup) {
            return;
        }
        var parsedAnno = _getParsedAnnotation(markup);
        if (!parsedAnno) {
            return;
        }
        if (selected && markup.dataset.selected == "false") {
            markup.dataset.selected = "true";
            switch (parsedAnno.type) {
                case _markupTypes.leaderLine :
                    _addLeaderLineAnchorPoints(parsedAnno, markup);
                    _addMarkupMoveEvents(document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id));
                    _markupMode.selectedAnnotations.push(markup);
                    break;
                case _markupTypes.polyline :
                    _markupMode.selectedAnnotations.push(markup.parentNode);
                    for (var i = 0; i < markup.parentNode.childNodes.length; i++) {
                        if (markup.parentNode.childNodes[i].tagName == "polyline") {
                            _highlightPdfAnnotationShape(markup.parentNode.childNodes[i], _uiColors.markup.selecedLine);
                        }
                    }
                    break;
                case _markupTypes.rectangle :
                case _markupTypes.rectangleFilled :
                case _markupTypes.ellipse :
                case _markupTypes.ellipseFilled :
                    _addShapeAnchorPoints(parsedAnno, markup, false);
                    _addMarkupMoveEvents(markup);
                    _markupMode.selectedAnnotations.push(markup);
                    break;
                case _markupTypes.polygon :
                case _markupTypes.polygonFilled :
                    _markupMode.selectedAnnotations.push(markup);
                    _highlightPdfAnnotationShape(markup, _uiColors.markup.selecedLine);
                    break;
                case _markupTypes.freehand :
                    _addShapeAnchorPoints(parsedAnno, markup, true);
                    _addMarkupMoveEvents(markup);
                    _markupMode.selectedAnnotations.push(markup);
                    break;
                case _markupTypes.note :
                    _addNoteAnchorPoints(parsedAnno, markup, parsedAnno.boundingBox);
                    _addShapeAnchorPointsEvents();
                    var anchorBox = document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id);
                    _addMarkupMoveEvents(anchorBox);
                    anchorBox.addEventListener("dblclick", _handleNoteEditTextEvent);
                    _markupMode.selectedAnnotations.push(markup);
                    break;
                case _markupTypes.noteLeader :
                    _addNoteLeaderAnchorPoints(parsedAnno, markup);
                    var anchorBox = document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id);
                    _addMarkupMoveEvents(anchorBox);
                    anchorBox.addEventListener("dblclick", _handleNoteEditTextEvent);
                    _markupMode.selectedAnnotations.push(markup);
                    break;
                case _markupTypes.stamp :
                    //
                    break;
                case _markupTypes.textUnderline :
                case _markupTypes.textStrikethrough :
                case _markupTypes.textHighlight :
                    _addTextAnchorBox(parsedAnno, markup);
                    _markupMode.selectedAnnotations.push(markup);
                    break;
                default:
                    break;
            }
            _reorderSVGElement(markup, _markupEdit.drag, true);
            _markupObserver.set("annoSelected", parsedAnno.id, "add");
        } else if (!selected && markup.dataset.selected == "true") {
            switch (parsedAnno.type) {
                case _markupTypes.leaderLine :
                    _removeAnchorPoints(markup);
                    break;
                case _markupTypes.polyline :
                    for (var i = 0; i < markup.childNodes.length; i++) {
                        if (markup.childNodes[i].tagName == "polyline") {
                            _highlightPdfAnnotationShape(markup.childNodes[i], _uiColors.markup.line);
                        }
                    }
                    break;
                case _markupTypes.rectangle :
                case _markupTypes.rectangleFilled :
                case _markupTypes.ellipse :
                case _markupTypes.ellipseFilled :
                    _removeAnchorPoints(markup);
                    break;
                case _markupTypes.polygon :
                case _markupTypes.polygonFilled :
                    _highlightPdfAnnotationShape(markup, _uiColors.markup.line);
                    break;
                case _markupTypes.freehand :
                    _removeAnchorPoints(markup);
                    break;
                case _markupTypes.note :
                case _markupTypes.noteLeader :
                    _removeAnchorPoints(markup.parentNode);
                    break;
                case _markupTypes.stamp :
                    //
                    break;
                case _markupTypes.textHighlight :
                case _markupTypes.textUnderline :
                case _markupTypes.textStrikethrough :
                    markup.parentNode.removeChild(markup.parentNode.childNodes[1]);
                    break;
                default:
                    break;
            }
            markup.dataset.selected = "false";
            _reorderSVGElement(markup, _markupEdit.drag, false);
            var pageNo = _getParsedAnnotation(markup).pageNo;
            _markupMode.selectedAnnotations.splice(_markupMode.selectedAnnotations.indexOf(markup), 1);
            if (_markupMode.selectedAnnotations.map(function(x){ return _getParsedAnnotation(x).pageNo }).indexOf(pageNo) == -1) {
                _removeMarkupMoveEvents(markup);
            }
            _markupObserver.set("annoSelected", parsedAnno.id, "remove");
        }
    }
    /**
    * Add anchor points to target
    * @param {JSON object} parsedAnno The parsed representation of the markup
    * @param {DOM element} target The markup dom element
    * @param {bool} keepRatio True then anchor points will be added only at corners.
    * @private
    * @memberof ThingView
    **/
    function _addShapeAnchorPoints (parsedAnno, target, keepRatio) {
        var targetParent = target.parentNode;
        var canvas = document.getElementById("PdfAnnotationCanvas" + parsedAnno.pageNo);
        var box = _getCorrectedBoundingBox(parsedAnno.vertices, canvas, __ZOOMSCALE);
        var anchorGroup = _buildShapeAnchorPoints(box, parsedAnno.id, keepRatio);
        targetParent.innerHTML = anchorGroup;
        targetParent.insertBefore(target, targetParent.firstChild);
        _addShapeAnchorPointsEvents();
    }

    function _addNoteAnchorPoints (parsedAnno, target, vertices) {
        var targetParent = target.parentNode.parentNode;
        var targetGroup = targetParent.firstChild;
        var canvas = document.getElementById("PdfAnnotationCanvas" + parsedAnno.pageNo);
        var box = _getCorrectedBoundingBox(vertices, canvas, __ZOOMSCALE);
        var anchorGroup = _buildShapeAnchorPoints(box, parsedAnno.id);
        targetParent.innerHTML = anchorGroup;
        targetParent.insertBefore(targetGroup, targetParent.firstChild);
        document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id).setAttribute("fill", _uiColors.anchor.boxFill);
    }

    function _addNoteLeaderAnchorPoints (parsedAnno, target) {
        var pageHeight = parseInt(document.getElementById("PdfAnnotationCanvas" + parsedAnno.pageNo).clientHeight);
        var boxVertices = _getNoteBoxVerticesFromMarkup(target, pageHeight);
        _addNoteAnchorPoints(parsedAnno, target, boxVertices);
        var anchorPointPre = "<rect width='" + _uiSizes.anchor.width + "' height='" + _uiSizes.anchor.height + "' class='PdfMarkupAnchor' data-annoid='" + parsedAnno.id + "' id='PdfMarkupAnchor";
        var anchorPointPost = " stroke=" + _uiColors.anchor.fill + " fill=" + _uiColors.anchor.fill + " ></rect>";
        var lx = parsedAnno.leaderLineVertices[0] * __ZOOMSCALE;
        var ly = pageHeight - (parsedAnno.leaderLineVertices[1] * __ZOOMSCALE);
        var pointL = anchorPointPre + "L" + parsedAnno.id + "' x='" + (lx - (_uiSizes.anchor.width/2)) + "' y='" + (ly - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
        var anchorGroup = document.getElementById("PdfMarkupAnchorGroup" + parsedAnno.id);
        anchorGroup.innerHTML += pointL;
        _addShapeAnchorPointsEvents();
    }

    function _addTextAnchorBox (parsedAnno, target) {
        var targetParent = target.parentNode;
        var canvas = document.getElementById("PdfAnnotationCanvas" + parsedAnno.pageNo);
        var box = _getCorrectedBoundingBox(parsedAnno.boundingBox, canvas, __ZOOMSCALE);
        var anchorGroup = _buildTextAnchorGroup(box, parsedAnno.id);
        targetParent.innerHTML = anchorGroup;
        targetParent.insertBefore(target, targetParent.firstChild);
    }

    function _getNoteBoxVerticesFromMarkup (markup, pageHeight) {
        var x1 = parseFloat(markup.attributes.x.nodeValue) / __ZOOMSCALE;
        var y1 = (pageHeight - parseFloat(markup.attributes.y.nodeValue)) / __ZOOMSCALE;
        var x2 = (parseFloat(markup.attributes.x.nodeValue) + parseFloat(markup.attributes.width.nodeValue)) / __ZOOMSCALE;
        var y2 = (pageHeight - (parseFloat(markup.attributes.y.nodeValue) + parseFloat(markup.attributes.height.nodeValue))) / __ZOOMSCALE;
        var boxVertices = [x1, y1, x2, y2];
        return boxVertices;
    }

    function _buildShapeAnchorBox (box, annoNumber, keepRatio) {
        var boxPre = "<rect class='PdfMarkupAnchorBox' data-annoid='" + annoNumber + "' id='PdfMarkupAnchorBox" + annoNumber + "'";
        var boxPost = " stroke=" + _uiColors.anchor.box + " fill='none' stroke-width='" + _uiSizes.anchor.boxLine + "'></rect>";
        var width = Math.abs(box.x2 - box.x1), height = Math.abs(box.y2 - box.y1);
        return boxPre + "x='" + box.x1 + "' y='" + box.y1 + "' width='" + width + "' height='" + height + "'" + (keepRatio === true ? " orgx='" + box.x1 + "' orgy='" + box.y1 + "' orgwidth='" + width + "' orgheight='" + height + "'" : "") + boxPost;
    }

    function _buildShapeAnchorPoints (box, annoNumber, keepRatio) {
        var anchorPointPre = "<rect width='" + _uiSizes.anchor.width + "' height='" + _uiSizes.anchor.height + "' class='PdfMarkupAnchor' data-annoid='" + annoNumber + "' id='PdfMarkupAnchor";
        var anchorPointPost = " stroke=" + _uiColors.anchor.fill + " fill=" + _uiColors.anchor.fill + " ></rect>";
        var pointx1y1 = anchorPointPre + "NW" + annoNumber + "' x='" + (box.x1 - (_uiSizes.anchor.width/2)) + "' y='" + (box.y1 - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
        var pointx2y1 = anchorPointPre + "NE" + annoNumber + "' x='" + (box.x2 - (_uiSizes.anchor.width/2)) + "' y='" + (box.y1 - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
        var pointx2y2 = anchorPointPre + "SE" + annoNumber + "' x='" + (box.x2 - (_uiSizes.anchor.width/2)) + "' y='" + (box.y2 - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
        var pointx1y2 = anchorPointPre + "SW" + annoNumber + "' x='" + (box.x1 - (_uiSizes.anchor.width/2)) + "' y='" + (box.y2 - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
        var pointx1 = "", pointx2 = "", pointy1 = "", pointy2 = "";
        if (keepRatio !== true) {
            pointx1 = anchorPointPre + "W" + annoNumber + "' x='" + (box.x1 - (_uiSizes.anchor.width/2)) + "' y='" + (((box.y1 + box.y2)/2) - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
            pointx2 = anchorPointPre + "E" + annoNumber + "' x='" + (box.x2 - (_uiSizes.anchor.width/2)) + "' y='" + (((box.y1 + box.y2)/2) - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
            pointy1 = anchorPointPre + "N" + annoNumber + "' x='" + (((box.x1 + box.x2)/2) - (_uiSizes.anchor.width/2)) + "' y='" + (box.y1 - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
            pointy2 = anchorPointPre + "S" + annoNumber + "' x='" + (((box.x1 + box.x2)/2) - (_uiSizes.anchor.width/2)) + "' y='" + (box.y2 - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
        }
        return "<g id='PdfMarkupAnchorGroup" + annoNumber + "'>" + _buildShapeAnchorBox(box, annoNumber, keepRatio) + pointx1y1 + pointx2y1 + pointx2y2 + pointx1y2 + (keepRatio !== true ? (pointx1 + pointx2 + pointy1 + pointy2) : "") + "</g>";
    }

    function _buildTextAnchorGroup(box, annoNumber) {
        return "<g id='PdfMarkupAnchorGroup" + annoNumber + "'>" + _buildShapeAnchorBox(box, annoNumber) + "</g>";
    }

    function _addShapeAnchorPointsEvents () {
        var anchorPoints = document.getElementsByClassName("PdfMarkupAnchor");
        for (var i = 0; i < anchorPoints.length; i++) {
            anchorPoints[i].addEventListener("mouseenter", _handleShapeMarkupEditEvent);
            anchorPoints[i].addEventListener("mouseleave", function () { if (!_markupEdit.edit){ document.getElementById(_currentCanvasId).style.cursor = "auto"; }});
            anchorPoints[i].addEventListener("mousedown", _handleShapeMarkupEditEvent);
        }
        anchorPoints[0].parentNode.parentNode.parentNode.addEventListener("mousemove", _handleShapeMarkupEditEvent);
        anchorPoints[0].parentNode.parentNode.parentNode.addEventListener("mouseup", _handleShapeMarkupEditEvent);
    }

    function _addLeaderLineAnchorPoints (parsedAnno, target) {
        var targetParent = target.parentNode;
        var canvas = document.getElementById("PdfAnnotationCanvas" + parsedAnno.pageNo);
        var anchorGroup = _buildLineAnchorPoints(parsedAnno.vertices, parseInt(canvas.clientHeight), parsedAnno.id);
        targetParent.innerHTML = anchorGroup;
        targetParent.insertBefore(target, targetParent.firstChild);
        _addShapeAnchorPointsEvents();
    }

    function _buildLineAnchorPoints (box, pageHeight, annoNumber) {
        var anchorPointPre = "<rect width='" + _uiSizes.anchor.width + "' height='" + _uiSizes.anchor.height + "' class='PdfMarkupAnchor' data-annoid='" + annoNumber + "' id='PdfMarkupAnchor";
        var anchorPointPost = " stroke=" + _uiColors.anchor.fill + " fill=" + _uiColors.anchor.fill + " ></rect>";
        var pointx1y1 = anchorPointPre + "N" + annoNumber + "' x='" + ((box[0] * __ZOOMSCALE) - (_uiSizes.anchor.width/2)) + "' y='" + ((pageHeight - (box[1] * __ZOOMSCALE)) - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
        var pointx2y2 = anchorPointPre + "S" + annoNumber + "' x='" + ((box[2] * __ZOOMSCALE) - (_uiSizes.anchor.width/2)) + "' y='" + ((pageHeight - (box[3] * __ZOOMSCALE)) - (_uiSizes.anchor.height/2)) + "'" + anchorPointPost;
        return "<g id='PdfMarkupAnchorGroup" + annoNumber + "'>" + _buildLineAnchorBox(box, annoNumber, pageHeight) + pointx1y1 + pointx2y2 + "</g>";
    }

    function _buildLineAnchorBox (box, annoNumber, pageHeight) {
        var boxPre = "<polygon class='PdfMarkupAnchorBox' data-annoid='" + annoNumber + "' id='PdfMarkupAnchorBox" + annoNumber + "'";
        var boxPost = " stroke=" + _uiColors.anchor.box + " fill=" + _uiColors.anchor.boxFill + " stroke-width='" + _uiSizes.anchor.boxLine + "'></polygon>";
        if ((box[0] < box[2] && box[1] > box[3]) || (box[0] > box[2] && box[1] < box[3])) {
            return boxPre + "points='" + ((box[0] * __ZOOMSCALE) + _uiSizes.anchor.boxMargin) + "," + ((pageHeight - (box[1] * __ZOOMSCALE)) - _uiSizes.anchor.boxMargin) + " " +
                                         ((box[2] * __ZOOMSCALE) + _uiSizes.anchor.boxMargin) + "," + ((pageHeight - (box[3] * __ZOOMSCALE)) - _uiSizes.anchor.boxMargin) + " " +
                                         ((box[2] * __ZOOMSCALE) - _uiSizes.anchor.boxMargin) + "," + ((pageHeight - (box[3] * __ZOOMSCALE)) + _uiSizes.anchor.boxMargin) + " " +
                                         ((box[0] * __ZOOMSCALE) - _uiSizes.anchor.boxMargin) + "," + ((pageHeight - (box[1] * __ZOOMSCALE)) + _uiSizes.anchor.boxMargin) + " " + "'" + boxPost;
        }
        return boxPre + "points='" + ((box[0] * __ZOOMSCALE) - _uiSizes.anchor.boxMargin) + "," + ((pageHeight - (box[1] * __ZOOMSCALE)) - _uiSizes.anchor.boxMargin) + " " +
                                     ((box[2] * __ZOOMSCALE) - _uiSizes.anchor.boxMargin) + "," + ((pageHeight - (box[3] * __ZOOMSCALE)) - _uiSizes.anchor.boxMargin) + " " +
                                     ((box[2] * __ZOOMSCALE) + _uiSizes.anchor.boxMargin) + "," + ((pageHeight - (box[3] * __ZOOMSCALE)) + _uiSizes.anchor.boxMargin) + " " +
                                     ((box[0] * __ZOOMSCALE) + _uiSizes.anchor.boxMargin) + "," + ((pageHeight - (box[1] * __ZOOMSCALE)) + _uiSizes.anchor.boxMargin) + " " + "'" + boxPost;
    }

    function _handleShapeMarkupEditEvent (e) {
        if ((e.buttons && e.button && e.buttons != 0 && e.button != 0) ||
            (_checkPageRotation() != 0)) {
                return;
        }
        var markupTarget;
        e.stopPropagation();
        switch (e.type) {
            case "mouseenter":
                if (!_markupEdit.move) {
                    _setMarkupEditCursor(e.target);
                }
                break;
            case "mouseleave" :
                if (_markupEdit.edit && !_markupEdit.move && _markupEdit.drag.state && _markupEdit.drag.target) {
                    _markupEdit.edit = false;
                    markupTarget = document.getElementById("PdfAnnotationElement" + _markupEdit.drag.target.dataset.annoid);
                    _reorderSVGElement(markupTarget, _markupEdit.drag, false);
                    _markupEdit.drag.target = null;
                    _markupEdit.drag.state = false;
                    document.getElementById(_currentCanvasId).style.cursor = "auto";
                    if (_markupEdit.viewDirty) {
                        _markupEdit.viewDirty = false;
                        _markupObserver.set("annoSetEdited");
                    }
                }
                break;
            case "mousedown" :
                if (!_markupEdit.move) {
                    _markupEdit.edit = true;
                    if (e.pageX && e.pageY) {
                        _markupEdit.drag.x = e.pageX;
                        _markupEdit.drag.y = e.pageY;

                        _markupEdit.drag.startX = e.pageX;
                        _markupEdit.drag.startY = e.pageY;
                    } else {
                        _markupEdit.drag.x = _markupEdit.cachedX;
                        _markupEdit.drag.y = _markupEdit.cachedY;

                        _markupEdit.drag.startX = _markupEdit.cachedX;
                        _markupEdit.drag.startY = _markupEdit.cachedY;
                    }
                    _markupEdit.drag.state = true;
                    _markupEdit.drag.target = e.target;
                    markupTarget = document.getElementById("PdfAnnotationElement" + e.target.dataset.annoid);
                    _reorderSVGElement(markupTarget, _markupEdit.drag, true);
                }
                break;
            case "mousemove" :
                if (_markupEdit.edit && !_markupEdit.move && _markupEdit.drag.state && _markupEdit.drag.target) {
                    if (_markupEdit.drag.x > -1 && _markupEdit.drag.y > -1) {
                        if (!_markupEdit.preventDeselect) {
                            _markupEdit.preventDeselect = true;
                        }
                        var deltaX = e.pageX - _markupEdit.drag.x;
                        var deltaY = e.pageY - _markupEdit.drag.y;
                        markupTarget = document.getElementById("PdfAnnotationElement" + _markupEdit.drag.target.dataset.annoid);
                        _markupEdit.cachedX = e.pageX;
                        _markupEdit.cachedY = e.pageY;
                        _markupEdit.drag.x = e.pageX;
                        _markupEdit.drag.y = e.pageY;
                        var markupType = _pdfParsedAnnotationSet[parseInt(markupTarget.dataset.annoid)].type;
                        switch (markupType) {
                            case _markupTypes.rectangle :
                            case _markupTypes.rectangleFilled :
                                _dragEditRectangleMarkup(_markupEdit.drag.target, markupTarget, deltaX, deltaY);
                                break;
                            case _markupTypes.ellipse :
                            case _markupTypes.ellipseFilled :
                                _dragEditEllipseMarkup(_markupEdit.drag.target, markupTarget, deltaX, deltaY);
                                break;
                            case _markupTypes.leaderLine :
                                _dragEditLeaderLineMarkup(_markupEdit.drag.target, markupTarget, deltaX, deltaY);
                                break;
                            case _markupTypes.note :
                            case _markupTypes.noteLeader :
                                _dragEditNoteMarkup(_markupEdit.drag.target, markupTarget, deltaX, deltaY);
                                break;
                            case _markupTypes.freehand :
                                _dragEditFreehandMarkup(_markupEdit.drag.target,
                                                        _markupEdit.drag.x, _markupEdit.drag.y,
                                                        _markupEdit.drag.startX, _markupEdit.drag.startY);
                                break;
                            default:
                                break;
                        }
                        if (!_markupEdit.viewDirty) {
                            _markupEdit.viewDirty = true;
                            _pushActionToMarkupHistory(_undoPresets.resize, markupTarget.dataset.annoid, _getParsedAnnotation(markupTarget));
                        }
                    }
                }
                break;
            case "mouseup" :
                if (_markupEdit.edit && !_markupEdit.move && _markupEdit.drag.state && _markupEdit.drag.target) {
                    markupTarget = document.getElementById("PdfAnnotationElement" + _markupEdit.drag.target.dataset.annoid);
                    _reorderSVGElement(markupTarget, _markupEdit.drag, false);
                    switch (_pdfParsedAnnotationSet[parseInt(markupTarget.dataset.annoid)].type) {
                        case _markupTypes.freehand:
                            _dropEditFreehandMarkup(_markupEdit.drag.target, markupTarget);
                            break;
                        default:
                            break;
                    }
                    _markupEdit.preventDeselect = false;
                    _markupEdit.drag.state = false;
                    _markupEdit.drag.target = null;
                    _markupEdit.drag.x = -1;
                    _markupEdit.drag.y = -1;
                    _markupEdit.drag.startX = -1;
                    _markupEdit.drag.startY = -1;
                    _markupEdit.edit = false;

                    if (_markupEdit.viewDirty) {
                        _markupEdit.viewDirty = false;
                        _markupObserver.set("annoSetEdited");
                    }
                    document.getElementById(_currentCanvasId).style.cursor = "auto";
                }
                break;
            default :
                break;
        }
    }

    function _dragEditFreehandAnchor(anchorBox, curX, curY, startX, startY, flipX, flipY) {
        var orgWidth = parseFloat(anchorBox.attributes.orgwidth.nodeValue);
        var orgHeight = parseFloat(anchorBox.attributes.orgheight.nodeValue);
        var curWidth = parseFloat(anchorBox.attributes.width.nodeValue);
        var curHeight = parseFloat(anchorBox.attributes.height.nodeValue);

        var offX = curX - startX;
        var offY = curY - startY;
        var slope = (orgHeight * flipY) / (orgWidth * flipX);
        var scale = 1;
        if (flipY == 1) {
            if (offY <= slope * offX) {
                scale = Math.max((orgHeight - offY * flipY) / orgHeight, 0);
            } else if (offY > slope * offX) {
                scale = Math.max((orgWidth - offX * flipX) / orgWidth, 0);
            }
        } else {
            if (offY <= slope * offX) {
                scale = Math.max((orgWidth - offX * flipX) / orgWidth, 0);
            } else if (offY > slope * offX) {
                scale = Math.max((orgHeight - offY * flipY) / orgHeight, 0);
            }
        }

        var newWidth = orgWidth * scale;
        var newHeight = orgHeight * scale;

        anchorBox.setAttribute("width", newWidth);
        anchorBox.setAttribute("height", newHeight);

        return {x: newWidth - curWidth, y: newHeight - curHeight};
    }

    function _dragEditFreehandMarkup(anchorTarget, curX, curY, startX, startY) {
        var annoId = _pdfParsedAnnotationSet[parseInt(anchorTarget.dataset.annoid)].id;
        var anchorBox = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorBox" + annoId);
        switch (anchorTarget.id) {
            case "PdfMarkupAnchorNW" + annoId:
                {
                    let offset = _dragEditFreehandAnchor(anchorBox, curX, curY, startX, startY, 1, 1);

                    anchorBox.setAttribute("x", parseFloat(anchorBox.attributes.x.nodeValue) - offset.x);
                    anchorBox.setAttribute("y", parseFloat(anchorBox.attributes.y.nodeValue) - offset.y);

                    anchorTarget.setAttribute("x", parseFloat(anchorTarget.attributes.x.nodeValue) - offset.x);
                    anchorTarget.setAttribute("y", parseFloat(anchorTarget.attributes.y.nodeValue) - offset.y);

                    let anchorSW = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorSW" + annoId);
                    anchorSW.setAttribute("x", parseFloat(anchorSW.attributes.x.nodeValue) - offset.x);

                    let anchorNE = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorNE" + annoId);
                    anchorNE.setAttribute("y", parseFloat(anchorNE.attributes.y.nodeValue) - offset.y);
                }
                break;
            case "PdfMarkupAnchorNE" + annoId:
                {
                    let offset = _dragEditFreehandAnchor(anchorBox, curX, curY, startX, startY, -1, 1);

                    anchorBox.setAttribute("y", parseFloat(anchorBox.attributes.y.nodeValue) - offset.y);

                    anchorTarget.setAttribute("x", parseFloat(anchorTarget.attributes.x.nodeValue) + offset.x);
                    anchorTarget.setAttribute("y", parseFloat(anchorTarget.attributes.y.nodeValue) - offset.y);

                    let anchorSE = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorSE" + annoId);
                    anchorSE.setAttribute("x", parseFloat(anchorSE.attributes.x.nodeValue) + offset.x);

                    let anchorNW = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorNW" + annoId);
                    anchorNW.setAttribute("y", parseFloat(anchorNW.attributes.y.nodeValue) - offset.y);
                }
                break;
            case "PdfMarkupAnchorSE" + annoId:
                {
                    let offset = _dragEditFreehandAnchor(anchorBox, curX, curY, startX, startY, -1, -1);

                    anchorTarget.setAttribute("x", parseFloat(anchorTarget.attributes.x.nodeValue) + offset.x);
                    anchorTarget.setAttribute("y", parseFloat(anchorTarget.attributes.y.nodeValue) + offset.y);

                    let anchorNE = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorNE" + annoId);
                    anchorNE.setAttribute("x", parseFloat(anchorNE.attributes.x.nodeValue) + offset.x);

                    let anchorSW = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorSW" + annoId);
                    anchorSW.setAttribute("y", parseFloat(anchorSW.attributes.y.nodeValue) + offset.y);
                }
                break;
            case "PdfMarkupAnchorSW" + annoId:
                {
                    let offset = _dragEditFreehandAnchor(anchorBox, curX, curY, startX, startY, 1, -1);

                    anchorBox.setAttribute("x", parseFloat(anchorBox.attributes.x.nodeValue) - offset.x);

                    anchorTarget.setAttribute("x", parseFloat(anchorTarget.attributes.x.nodeValue) - offset.x);
                    anchorTarget.setAttribute("y", parseFloat(anchorTarget.attributes.y.nodeValue) + offset.y);

                    let anchorNW = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorNW" + annoId);
                    anchorNW.setAttribute("x", parseFloat(anchorNW.attributes.x.nodeValue) - offset.x);

                    let anchorSE = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorSE" + annoId);
                    anchorSE.setAttribute("y", parseFloat(anchorSE.attributes.y.nodeValue) + offset.y);
                }
                break;
            default:
                break;
        }
    }

    function _dropEditFreehandMarkup (anchorTarget, markupTarget) {
        var parsedAnno = _pdfParsedAnnotationSet[parseInt(anchorTarget.dataset.annoid)],
            annoId = parsedAnno.id,
            anchorBox = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorBox" + annoId),
            orgWidth = parseFloat(anchorBox.attributes.orgwidth.nodeValue),
            curWidth = parseFloat(anchorBox.attributes.width.nodeValue),
            orgX = parseFloat(anchorBox.attributes.orgx.nodeValue),
            orgY = parseFloat(anchorBox.attributes.orgy.nodeValue),
            curX = parseFloat(anchorBox.attributes.x.nodeValue),
            curY = parseFloat(anchorBox.attributes.y.nodeValue),
            scale = curWidth / orgWidth,
            canvasHeight = parseInt(markupTarget.parentNode.parentNode.clientHeight);

        if (markupTarget.attributes.d) {
            var coords = markupTarget.attributes.d.nodeValue.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g);
            var newPath = "";
            var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE,
                maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
            for (var i=0;i<coords.length/2;i++) {
                // Calculate coordinates
                coords[i*2] = (parseFloat(coords[i*2]) - orgX) * scale + curX;
                coords[i*2+1] = (parseFloat(coords[i*2+1]) - orgY) * scale + curY;

                // Calculate min/max
                minX = Math.min(minX, coords[i*2]); maxX = Math.max(maxX, coords[i*2]);
                minY = Math.min(minY, coords[i*2+1]); maxY = Math.max(maxY, coords[i*2+1]);

                // Update vertices of annotation
                parsedAnno.vertices[i*2] = coords[i*2] / __ZOOMSCALE;
                parsedAnno.vertices[i*2+1] = (canvasHeight - coords[i*2+1]) / __ZOOMSCALE;

                // Write a new path
                if (i==0) {
                    newPath += "M";
                    newPath += coords[i*2] + " " + coords[i*2+1];
                } else {
                    if (i%2==1) newPath += "Q";
                    newPath += coords[i*2] + " " + coords[i*2+1] + " ";
                }
            }
            // Update freehand path
            markupTarget.setAttribute("d", newPath);

            // Reset initial values of anchor box
            anchorBox.setAttribute("orgwidth", curWidth);
            anchorBox.setAttribute("orgheight", parseFloat(anchorBox.attributes.height.nodeValue));
            anchorBox.setAttribute("orgx", curX);
            anchorBox.setAttribute("orgy", curY);

            // Update bounding box of annotation
            parsedAnno.boundingBox[0] = minX / __ZOOMSCALE;
            parsedAnno.boundingBox[1] = (canvasHeight - maxY) / __ZOOMSCALE;
            parsedAnno.boundingBox[2] = maxX / __ZOOMSCALE;
            parsedAnno.boundingBox[3] = (canvasHeight - minY) / __ZOOMSCALE;
        }
    }

    function _dragEditRectangleMarkup (anchorTarget, markupTarget, deltaX, deltaY) {
        var parsedAnno = _pdfParsedAnnotationSet[parseInt(anchorTarget.dataset.annoid)];
        var annoId = parsedAnno.id;
        switch (anchorTarget.id) {
            case "PdfMarkupAnchorNW" + annoId:
                var northChanged = _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N", "S", 1, 3, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                var westChanged = _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W", "E", 2, 0, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                if (northChanged) {
                    if (westChanged) {
                        //SE
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorSE" + annoId).dispatchEvent(proxyDownEvent);
                    } else {
                        //SW
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorSW" + annoId).dispatchEvent(proxyDownEvent);
                    }
                } else if (westChanged) {
                    //NE
                    var proxyDownEvent = new Event('mousedown');
                    document.getElementById("PdfMarkupAnchorNE" + annoId).dispatchEvent(proxyDownEvent);
                } else {
                    document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                    document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                }
                break;
            case "PdfMarkupAnchorNE" + annoId:
                var northChanged = _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N", "S", 1, 3, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                var eastChanged = _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E", "W", 0, 2, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                if (northChanged) {
                    if (eastChanged) {
                        //SW
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorSW" + annoId).dispatchEvent(proxyDownEvent);
                    } else {
                        //SE
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorSE" + annoId).dispatchEvent(proxyDownEvent);
                    }
                } else if (eastChanged) {
                    //NW
                    var proxyDownEvent = new Event('mousedown');
                    document.getElementById("PdfMarkupAnchorNW" + annoId).dispatchEvent(proxyDownEvent);
                } else {
                    document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                    document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                }
                break;
            case "PdfMarkupAnchorSE" + annoId:
                var southChanged = _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S", "N", 3, 1, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                var eastChanged = _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E", "W", 0, 2, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                if (southChanged) {
                    if (eastChanged) {
                        //NW
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorNW" + annoId).dispatchEvent(proxyDownEvent);
                    } else {
                        //NE
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorNE" + annoId).dispatchEvent(proxyDownEvent);
                    }
                } else if (eastChanged) {
                    //SW
                    var proxyDownEvent = new Event('mousedown');
                    document.getElementById("PdfMarkupAnchorSW" + annoId).dispatchEvent(proxyDownEvent);
                } else {
                    document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                    document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                }
                break;
            case "PdfMarkupAnchorSW" + annoId:
                var southChanged = _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S", "N", 3, 1, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                var westChanged = _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W", "E", 2, 0, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                if (southChanged) {
                    if (westChanged) {
                        //NE
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorNE" + annoId).dispatchEvent(proxyDownEvent);
                    } else {
                        //NW
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorNW" + annoId).dispatchEvent(proxyDownEvent);
                    }
                } else if (westChanged) {
                    //SE
                    var proxyDownEvent = new Event('mousedown');
                    document.getElementById("PdfMarkupAnchorSE" + annoId).dispatchEvent(proxyDownEvent);
                } else {
                    document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                    document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                }
                break;
            case "PdfMarkupAnchorN" + annoId:
                _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N", "S", 1, 3, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                break;
            case "PdfMarkupAnchorS" + annoId:
                _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S", "N", 3, 1, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                break;
            case "PdfMarkupAnchorE" + annoId:
                _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E", "W", 0, 2, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                break;
            case "PdfMarkupAnchorW" + annoId:
                _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W", "E", 2, 0, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                break;
            default:
                break;
        }
    }

    /**
    * Edit a rectangle markup's height by draging an anchor point
    * Should only be called for anchors which can move on a vertical axis: N, S, NE, NW, SE, SW
    * @param {DOM element} markupTarget The markup dom element being altered
    * @param {DOM element} anchorTarget The anchor dom element receiving the event
    * @param {float} deltaY The distance being moved in pixels
    * @param {JSON object} parsedAnno The parsed representation of the markup
    * @param {string} anchorLetter The letter representing the anchor selected (e.g "N" for north)
    * @param {string} opposingLetter The letter representing the opposite anchor to the one selected (e.g "N" for north)
    * @param {int} lowerVertexIndex The index of the expected lower vertex
    * @param {int} upperVertexIndex The index of the expected upper vertex
    * @param {function} compareVerticesFunc Function to provide boolean value between the upper and lower indexed vertices
    * @return {bool} true if the markup has been inversed, otherwise false
    * @private
    * @memberof ThingView
    **/
    function _dragEditRectangleVerticalAnchor (markupTarget, anchorTarget, deltaY, parsedAnno, anchorLetter, opposingLetter, lowerVertexIndex, upperVertexIndex, compareVerticesFunc) {
        var newHeight;
        var annoId = parsedAnno.id;
        if (anchorLetter == "N") {
            newHeight = parseFloat(markupTarget.attributes.height.nodeValue) - deltaY;
        } else {
            newHeight = parseFloat(markupTarget.attributes.height.nodeValue) + deltaY;
        }
        if (newHeight > 0) {
            if (anchorLetter == "N") {
                markupTarget.setAttribute("y",  parseFloat(markupTarget.attributes.y.nodeValue) + deltaY);
                document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id).setAttribute("y", markupTarget.attributes.y.nodeValue);
            }
            markupTarget.setAttribute("height",  newHeight);
            anchorTarget.setAttribute("y",  parseFloat(anchorTarget.attributes.y.nodeValue) + deltaY);
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "E" + annoId).setAttribute("y",  anchorTarget.attributes.y.nodeValue);
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "W" + annoId).setAttribute("y",  anchorTarget.attributes.y.nodeValue);
            document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("y", parseFloat(document.getElementById("PdfMarkupAnchorE" + annoId).attributes.y.nodeValue) + (deltaY/2));
            document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("y", document.getElementById("PdfMarkupAnchorE" + annoId).attributes.y.nodeValue);
            document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("height", newHeight);
            if (compareVerticesFunc(lowerVertexIndex, upperVertexIndex)) {
                parsedAnno.vertices[lowerVertexIndex] -= (deltaY / __ZOOMSCALE);
            } else {
                parsedAnno.vertices[upperVertexIndex] -= (deltaY / __ZOOMSCALE);
            }
            return false;
        } else {
            if (anchorLetter == "N") {
                markupTarget.setAttribute("y",  parseFloat(markupTarget.attributes.y.nodeValue) + parseFloat(markupTarget.attributes.height.nodeValue));
                markupTarget.setAttribute("height", deltaY - parseFloat(markupTarget.attributes.height.nodeValue));
            } else {
                markupTarget.setAttribute("y",  parseFloat(markupTarget.attributes.y.nodeValue) - (Math.abs(deltaY) - parseFloat(markupTarget.attributes.height.nodeValue)));
                markupTarget.setAttribute("height", Math.abs(deltaY + parseFloat(markupTarget.attributes.height.nodeValue)));
            }
            if (!compareVerticesFunc(lowerVertexIndex, upperVertexIndex)) {
                var vertexDistance = parsedAnno.vertices[upperVertexIndex] - parsedAnno.vertices[lowerVertexIndex];
                parsedAnno.vertices[upperVertexIndex] = parsedAnno.vertices[lowerVertexIndex];
                parsedAnno.vertices[lowerVertexIndex] -= (deltaY / __ZOOMSCALE) - vertexDistance;
            } else {
                var vertexDistance = parsedAnno.vertices[lowerVertexIndex] - parsedAnno.vertices[upperVertexIndex];
                parsedAnno.vertices[lowerVertexIndex] = parsedAnno.vertices[upperVertexIndex];
                parsedAnno.vertices[upperVertexIndex] -= (deltaY / __ZOOMSCALE) - vertexDistance;
            }
            var proxyUpEvent = new Event('mouseup');
            var svgLayer = document.getElementById("PdfAnnotationSvgLayer" + parsedAnno.pageNo);
            svgLayer.dispatchEvent(proxyUpEvent);
            var anchorGroup = document.getElementById("PdfMarkupAnchorGroup" + annoId);
            anchorGroup.parentNode.removeChild(anchorGroup);
            _addShapeAnchorPoints(parsedAnno, markupTarget, false);
            if (anchorTarget.id == "PdfMarkupAnchor" + anchorLetter + annoId) {
                var proxyDownEvent = new Event('mousedown');
                document.getElementById("PdfMarkupAnchor" + opposingLetter + annoId).dispatchEvent(proxyDownEvent);
            }
            return true;
        }
    }

    /**
    * Edit a rectangle markup's width by draging an anchor point
    * Should only be called for anchors which can move on a horizontal axis: E, W, NE, NW, SE, SW
    * @param {DOM element} markupTarget The markup dom element being altered
    * @param {DOM element} anchorTarget The anchor dom element receiving the event
    * @param {float} deltaX The distance being moved in pixels
    * @param {JSON object} parsedAnno The parsed representation of the markup
    * @param {string} anchorLetter The letter representing the anchor selected (e.g "E" for east)
    * @param {string} opposingLetter The letter representing the opposite anchor to the one selected (e.g "E" for east)
    * @param {int} lowerVertexIndex The index of the expected lower vertex
    * @param {int} upperVertexIndex The index of the expected upper vertex
    * @param {function} compareVerticesFunc Function to provide boolean value between the upper and lower indexed vertices
    * @return {bool} true if the markup has been inversed, otherwise false
    * @private
    * @memberof ThingView
    **/
    function _dragEditRectangleHorizontalAnchor (markupTarget, anchorTarget, deltaX, parsedAnno, anchorLetter, opposingLetter, lowerVertexIndex, upperVertexIndex, compareVerticesFunc) {
        var newWidth;
        var annoId = parsedAnno.id;
        if (anchorLetter == "W") {
            newWidth = parseFloat(markupTarget.attributes.width.nodeValue) - deltaX;
        } else {
            newWidth = parseFloat(markupTarget.attributes.width.nodeValue) + deltaX;
        }
        if (newWidth > 0) {
            if (anchorLetter == "W") {
                markupTarget.setAttribute("x",  parseFloat(markupTarget.attributes.x.nodeValue) + deltaX);
                document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("x", markupTarget.attributes.x.nodeValue);
            }
            markupTarget.setAttribute("width",  newWidth);
            anchorTarget.setAttribute("x",  parseFloat(anchorTarget.attributes.x.nodeValue) + deltaX);
            document.getElementById("PdfMarkupAnchorN" + anchorLetter + annoId).setAttribute("x",  anchorTarget.attributes.x.nodeValue);
            document.getElementById("PdfMarkupAnchorS" + anchorLetter + annoId).setAttribute("x",  anchorTarget.attributes.x.nodeValue);
            document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("x", parseFloat(document.getElementById("PdfMarkupAnchorN" + annoId).attributes.x.nodeValue) + (deltaX/2));
            document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("x", document.getElementById("PdfMarkupAnchorN" + annoId).attributes.x.nodeValue);
            document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("width", newWidth);
            if (compareVerticesFunc(lowerVertexIndex, upperVertexIndex)) {
                parsedAnno.vertices[lowerVertexIndex] += (deltaX / __ZOOMSCALE);
            } else {
                parsedAnno.vertices[upperVertexIndex] += (deltaX / __ZOOMSCALE);
            }
            return false;
        } else {
            if (anchorLetter == "W") {
                markupTarget.setAttribute("x",  parseFloat(markupTarget.attributes.x.nodeValue) + parseFloat(markupTarget.attributes.width.nodeValue));
                markupTarget.setAttribute("width", deltaX - parseFloat(markupTarget.attributes.width.nodeValue));
            } else {
                markupTarget.setAttribute("x", parseFloat(markupTarget.attributes.x.nodeValue) - (Math.abs(deltaX) - parseFloat(markupTarget.attributes.width.nodeValue)));
                markupTarget.setAttribute("width", Math.abs(deltaX + parseFloat(markupTarget.attributes.width.nodeValue)));
            }
            if (!compareVerticesFunc(lowerVertexIndex, upperVertexIndex)) {
                var vertexDistance = parsedAnno.vertices[upperVertexIndex] - parsedAnno.vertices[lowerVertexIndex];
                parsedAnno.vertices[upperVertexIndex] = parsedAnno.vertices[lowerVertexIndex];
                parsedAnno.vertices[lowerVertexIndex] += (deltaX / __ZOOMSCALE) + vertexDistance;
            } else {
                var vertexDistance = parsedAnno.vertices[lowerVertexIndex] - parsedAnno.vertices[upperVertexIndex];
                parsedAnno.vertices[lowerVertexIndex] = parsedAnno.vertices[upperVertexIndex];
                parsedAnno.vertices[upperVertexIndex] += (deltaX / __ZOOMSCALE) + vertexDistance;
            }
            var proxyUpEvent = new Event('mouseup');
            var svgLayer = document.getElementById("PdfAnnotationSvgLayer" + parsedAnno.pageNo);
            svgLayer.dispatchEvent(proxyUpEvent);
            var anchorGroup = document.getElementById("PdfMarkupAnchorGroup" + annoId);
            anchorGroup.parentNode.removeChild(anchorGroup);
            _addShapeAnchorPoints(parsedAnno, markupTarget, false);
            if (anchorTarget.id == "PdfMarkupAnchor" + anchorLetter + annoId) {
                var proxyDownEvent = new Event('mousedown');
                document.getElementById("PdfMarkupAnchor" + opposingLetter + annoId).dispatchEvent(proxyDownEvent);
            }
            return true;
        }
    }

    function _dragEditEllipseMarkup (anchorTarget, markupTarget, deltaX, deltaY) {
        var parsedAnno = _pdfParsedAnnotationSet[parseInt(anchorTarget.dataset.annoid)];
        var annoId = parsedAnno.id;
        switch (anchorTarget.id) {
            case "PdfMarkupAnchorNW" + annoId:
                var northChanged = _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N", "S", 1, 3, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                var westChanged = _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W", "E", 2, 0, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                if (northChanged) {
                    if (westChanged) {
                        //SE
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorSE" + annoId).dispatchEvent(proxyDownEvent);
                    } else {
                        //SW
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorSW" + annoId).dispatchEvent(proxyDownEvent);
                    }
                } else if (westChanged) {
                    //NE
                    var proxyDownEvent = new Event('mousedown');
                    document.getElementById("PdfMarkupAnchorNE" + annoId).dispatchEvent(proxyDownEvent);
                } else {
                    document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                    document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                }
                break;
            case "PdfMarkupAnchorNE" + annoId:
                var northChanged = _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N", "S", 1, 3, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                var eastChanged = _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E", "W", 0, 2, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                if (northChanged) {
                    if (eastChanged) {
                        //SW
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorSW" + annoId).dispatchEvent(proxyDownEvent);
                    } else {
                        //SE
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorSE" + annoId).dispatchEvent(proxyDownEvent);
                    }
                } else if (eastChanged) {
                    //NW
                    var proxyDownEvent = new Event('mousedown');
                    document.getElementById("PdfMarkupAnchorNW" + annoId).dispatchEvent(proxyDownEvent);
                } else {
                    document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                    document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                }
                break;
            case "PdfMarkupAnchorSE" + annoId:
                var southChanged = _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S", "N", 3, 1, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                var eastChanged = _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E", "W", 0, 2, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                if (southChanged) {
                    if (eastChanged) {
                        //NW
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorNW" + annoId).dispatchEvent(proxyDownEvent);
                    } else {
                        //NE
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorNE" + annoId).dispatchEvent(proxyDownEvent);
                    }
                } else if (eastChanged) {
                    //SW
                    var proxyDownEvent = new Event('mousedown');
                    document.getElementById("PdfMarkupAnchorSW" + annoId).dispatchEvent(proxyDownEvent);
                } else {
                    document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                    document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                }
                break;
            case "PdfMarkupAnchorSW" + annoId:
                var southChanged = _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S", "N", 3, 1, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                var westChanged = _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W", "E", 2, 0, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                if (southChanged) {
                    if (westChanged) {
                        //NE
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorNE" + annoId).dispatchEvent(proxyDownEvent);
                    } else {
                        //NW
                        var proxyDownEvent = new Event('mousedown');
                        document.getElementById("PdfMarkupAnchorNW" + annoId).dispatchEvent(proxyDownEvent);
                    }
                } else if (westChanged) {
                    //SE
                    var proxyDownEvent = new Event('mousedown');
                    document.getElementById("PdfMarkupAnchorSE" + annoId).dispatchEvent(proxyDownEvent);
                } else {
                    document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                    document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                }
                break;
            case "PdfMarkupAnchorN" + annoId:
                _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N", "S", 1, 3, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                break;
            case "PdfMarkupAnchorS" + annoId:
                _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S", "N", 3, 1, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                break;
            case "PdfMarkupAnchorE" + annoId:
                _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E", "W", 0, 2, function(x, y){
                    return parsedAnno.vertices[x] > parsedAnno.vertices[y];
                });
                break;
            case "PdfMarkupAnchorW" + annoId:
                _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W", "E", 2, 0, function(x, y){
                    return parsedAnno.vertices[x] < parsedAnno.vertices[y];
                });
                break;
            default:
                break;
        }
    }

   /**
    * Edit a ellipse markup's height by draging an anchor point
    * Should only be called for anchors which can move on a vertical axis: N, S, NE, NW, SE, SW
    * @param {DOM element} markupTarget The markup dom element being altered
    * @param {DOM element} anchorTarget The anchor dom element receiving the event
    * @param {float} deltaY The distance being moved in pixels
    * @param {JSON object} parsedAnno The parsed representation of the markup
    * @param {string} anchorLetter The letter representing the anchor selected (e.g "N" for north)
    * @param {string} opposingLetter The letter representing the opposite anchor to the one selected (e.g "N" for north)
    * @param {int} lowerVertexIndex The index of the expected lower vertex
    * @param {int} upperVertexIndex The index of the expected upper vertex
    * @param {function} compareVerticesFunc Function to provide boolean value between the upper and lower indexed vertices
    * @return {bool} true if the markup has been inversed, otherwise false
    * @private
    * @memberof ThingView
    **/
    function _dragEditEllipseVerticalAnchor (markupTarget, anchorTarget, deltaY, parsedAnno, anchorLetter, opposingLetter, lowerVertexIndex, upperVertexIndex, compareVerticesFunc) {
        var newRy;
        var annoId = parsedAnno.id;
        if (anchorLetter == "N") {
            newRy = parseFloat(markupTarget.attributes.ry.nodeValue) - (deltaY / 2);
        } else {
            newRy = parseFloat(markupTarget.attributes.ry.nodeValue) + (deltaY / 2);
        }
        if (newRy > 0) {
            if (anchorLetter == "N") {
                document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id).setAttribute("y", parseFloat(document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id).attributes.y.nodeValue) + deltaY);
            }
            markupTarget.setAttribute("cy",  parseFloat(markupTarget.attributes.cy.nodeValue) + (deltaY / 2));
            markupTarget.setAttribute("ry",  newRy);
            anchorTarget.setAttribute("y",  parseFloat(anchorTarget.attributes.y.nodeValue) + deltaY);
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "E" + annoId).setAttribute("y",  anchorTarget.attributes.y.nodeValue);
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "W" + annoId).setAttribute("y",  anchorTarget.attributes.y.nodeValue);
            document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("y", parseFloat(document.getElementById("PdfMarkupAnchorE" + annoId).attributes.y.nodeValue) + (deltaY/2));
            document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("y", document.getElementById("PdfMarkupAnchorE" + annoId).attributes.y.nodeValue);
            document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("height", newRy*2);
            if (compareVerticesFunc(lowerVertexIndex, upperVertexIndex)) {
                parsedAnno.vertices[lowerVertexIndex] -= (deltaY / __ZOOMSCALE);
            } else {
                parsedAnno.vertices[upperVertexIndex] -= (deltaY / __ZOOMSCALE);
            }
            return false;
        } else {
            if (anchorLetter == "N") {
                markupTarget.setAttribute("cy",  parseFloat(markupTarget.attributes.cy.nodeValue) + (deltaY / 2));
                markupTarget.setAttribute("ry", (deltaY / 2) - parseFloat(markupTarget.attributes.ry.nodeValue));
            } else {
                markupTarget.setAttribute("cy",  parseFloat(markupTarget.attributes.cy.nodeValue) - Math.abs(deltaY / 2));
                markupTarget.setAttribute("ry", Math.abs((deltaY / 2) + parseFloat(markupTarget.attributes.ry.nodeValue)));
            }
            if (!compareVerticesFunc(lowerVertexIndex, upperVertexIndex)) {
                var vertexDistance = parsedAnno.vertices[upperVertexIndex] - parsedAnno.vertices[lowerVertexIndex];
                parsedAnno.vertices[upperVertexIndex] = parsedAnno.vertices[lowerVertexIndex];
                parsedAnno.vertices[lowerVertexIndex] -= (deltaY / __ZOOMSCALE) - vertexDistance;
            } else {
                var vertexDistance = parsedAnno.vertices[lowerVertexIndex] - parsedAnno.vertices[upperVertexIndex];
                parsedAnno.vertices[lowerVertexIndex] = parsedAnno.vertices[upperVertexIndex];
                parsedAnno.vertices[upperVertexIndex] -= (deltaY / __ZOOMSCALE) - vertexDistance;
            }
            var proxyUpEvent = new Event('mouseup');
            var svgLayer = document.getElementById("PdfAnnotationSvgLayer" + parsedAnno.pageNo);
            svgLayer.dispatchEvent(proxyUpEvent);
            var anchorGroup = document.getElementById("PdfMarkupAnchorGroup" + annoId);
            anchorGroup.parentNode.removeChild(anchorGroup);
            _addShapeAnchorPoints(parsedAnno, markupTarget, false);
            if (anchorTarget.id == "PdfMarkupAnchor" + anchorLetter + annoId) {
                var proxyDownEvent = new Event('mousedown');
                document.getElementById("PdfMarkupAnchor" + opposingLetter + annoId).dispatchEvent(proxyDownEvent);
            }
            return true;
        }
    }

    /**
    * Edit a ellipse markup's width by draging an anchor point
    * Should only be called for anchors which can move on a horizontal axis: E, W, NE, NW, SE, SW
    * @param {DOM element} markupTarget The markup dom element being altered
    * @param {DOM element} anchorTarget The anchor dom element receiving the event
    * @param {float} deltaX The distance being moved in pixels
    * @param {JSON object} parsedAnno The parsed representation of the markup
    * @param {string} anchorLetter The letter representing the anchor selected (e.g "E" for east)
    * @param {string} opposingLetter The letter representing the opposite anchor to the one selected (e.g "E" for east)
    * @param {int} lowerVertexIndex The index of the expected lower vertex
    * @param {int} upperVertexIndex The index of the expected upper vertex
    * @param {function} compareVerticesFunc Function to provide boolean value between the upper and lower indexed vertices
    * @return {bool} true if the markup has been inversed, otherwise false
    * @private
    * @memberof ThingView
    **/
    function _dragEditEllipseHorizontalAnchor (markupTarget, anchorTarget, deltaX, parsedAnno, anchorLetter, opposingLetter, lowerVertexIndex, upperVertexIndex, compareVerticesFunc) {
        var newRx;
        var annoId = parsedAnno.id;
        if (anchorLetter == "W") {
            newRx = parseFloat(markupTarget.attributes.rx.nodeValue) - (deltaX / 2);
        } else {
            newRx = parseFloat(markupTarget.attributes.rx.nodeValue) + (deltaX / 2);
        }
        if (newRx > 0) {
            if (anchorLetter == "W") {
                document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("x", parseFloat(document.getElementById("PdfMarkupAnchorBox" + annoId).attributes.x.nodeValue) + deltaX);
            }
            markupTarget.setAttribute("cx",  parseFloat(markupTarget.attributes.cx.nodeValue) + (deltaX / 2));
            markupTarget.setAttribute("rx",  newRx);
            anchorTarget.setAttribute("x",  parseFloat(anchorTarget.attributes.x.nodeValue) + deltaX);
            document.getElementById("PdfMarkupAnchorN" + anchorLetter + annoId).setAttribute("x",  anchorTarget.attributes.x.nodeValue);
            document.getElementById("PdfMarkupAnchorS" + anchorLetter + annoId).setAttribute("x",  anchorTarget.attributes.x.nodeValue);
            document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("x", parseFloat(document.getElementById("PdfMarkupAnchorN" + annoId).attributes.x.nodeValue) + (deltaX/2));
            document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("x", document.getElementById("PdfMarkupAnchorN" + annoId).attributes.x.nodeValue);
            document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("width", newRx * 2);
            if (compareVerticesFunc(lowerVertexIndex, upperVertexIndex)) {
                parsedAnno.vertices[lowerVertexIndex] += (deltaX / __ZOOMSCALE);
            } else {
                parsedAnno.vertices[upperVertexIndex] += (deltaX / __ZOOMSCALE);
            }
            return false;
        } else {
            if (anchorLetter == "W") {
                markupTarget.setAttribute("cx",  parseFloat(markupTarget.attributes.cx.nodeValue) + (deltaX / 2));
                markupTarget.setAttribute("rx", (deltaX / 2) - parseFloat(markupTarget.attributes.rx.nodeValue));
            } else {
                markupTarget.setAttribute("cx", parseFloat(markupTarget.attributes.cx.nodeValue) - (Math.abs(deltaX / 2)));
                markupTarget.setAttribute("rx", Math.abs((deltaX / 2) + parseFloat(markupTarget.attributes.rx.nodeValue)));
            }
            if (!compareVerticesFunc(lowerVertexIndex, upperVertexIndex)) {
                var vertexDistance = parsedAnno.vertices[upperVertexIndex] - parsedAnno.vertices[lowerVertexIndex];
                parsedAnno.vertices[upperVertexIndex] = parsedAnno.vertices[lowerVertexIndex];
                parsedAnno.vertices[lowerVertexIndex] += (deltaX / __ZOOMSCALE) + vertexDistance;
            } else {
                var vertexDistance = parsedAnno.vertices[lowerVertexIndex] - parsedAnno.vertices[upperVertexIndex];
                parsedAnno.vertices[lowerVertexIndex] = parsedAnno.vertices[upperVertexIndex];
                parsedAnno.vertices[upperVertexIndex] += (deltaX / __ZOOMSCALE) + vertexDistance;
            }
            var proxyUpEvent = new Event('mouseup');
            var svgLayer = document.getElementById("PdfAnnotationSvgLayer" + parsedAnno.pageNo);
            svgLayer.dispatchEvent(proxyUpEvent);
            var anchorGroup = document.getElementById("PdfMarkupAnchorGroup" + annoId);
            anchorGroup.parentNode.removeChild(anchorGroup);
            _addShapeAnchorPoints(parsedAnno, markupTarget, false);
            if (anchorTarget.id == "PdfMarkupAnchor" + anchorLetter + annoId) {
                var proxyDownEvent = new Event('mousedown');
                document.getElementById("PdfMarkupAnchor" + opposingLetter + annoId).dispatchEvent(proxyDownEvent);
            }
            return true;
        }
    }

    function _dragEditLeaderLineMarkup (anchorTarget, markupTarget, deltaX, deltaY) {
        var parsedAnno = _pdfParsedAnnotationSet[parseInt(anchorTarget.dataset.annoid)];
        var annoId = parsedAnno.id;
        var anchorBox = document.getElementById("PdfMarkupAnchorBox" + annoId);
        switch (anchorTarget.id) {
            case "PdfMarkupAnchorN" + annoId:
                markupTarget.setAttribute("x1", parseFloat(markupTarget.attributes.x1.nodeValue) + deltaX);
                markupTarget.setAttribute("y1", parseFloat(markupTarget.attributes.y1.nodeValue) + deltaY);
                parsedAnno.vertices[0] += (deltaX / __ZOOMSCALE);
                parsedAnno.vertices[1] -= (deltaY / __ZOOMSCALE);
                parsedAnno.boundingBox[0] += (deltaX / __ZOOMSCALE);
                parsedAnno.boundingBox[1] -= (deltaY / __ZOOMSCALE);
                break;
            case "PdfMarkupAnchorS" + annoId:
                markupTarget.setAttribute("x2", parseFloat(markupTarget.attributes.x2.nodeValue) + deltaX);
                markupTarget.setAttribute("y2", parseFloat(markupTarget.attributes.y2.nodeValue) + deltaY);
                parsedAnno.vertices[2] += (deltaX / __ZOOMSCALE);
                parsedAnno.vertices[3] -= (deltaY / __ZOOMSCALE);
                parsedAnno.boundingBox[2] += (deltaX / __ZOOMSCALE);
                parsedAnno.boundingBox[3] -= (deltaY / __ZOOMSCALE);
                break;
            default:
                break;
        }
        var x1  = parseFloat(markupTarget.attributes.x1.nodeValue);
        var y1  = parseFloat(markupTarget.attributes.y1.nodeValue);
        var x2  = parseFloat(markupTarget.attributes.x2.nodeValue);
        var y2  = parseFloat(markupTarget.attributes.y2.nodeValue);
        anchorBox.points.getItem(0).y = y1 - _uiSizes.anchor.boxMargin;
        anchorBox.points.getItem(1).y = y1 + _uiSizes.anchor.boxMargin;
        anchorBox.points.getItem(2).y = y2 + _uiSizes.anchor.boxMargin;
        anchorBox.points.getItem(3).y = y2 - _uiSizes.anchor.boxMargin;
        if ((x1 > x2 && y1 < y2) || (x1 < x2 && y1 > y2)) {
            anchorBox.points.getItem(0).x = x1 - _uiSizes.anchor.boxMargin;
            anchorBox.points.getItem(1).x = x1 + _uiSizes.anchor.boxMargin;
            anchorBox.points.getItem(2).x = x2 + _uiSizes.anchor.boxMargin;
            anchorBox.points.getItem(3).x = x2 - _uiSizes.anchor.boxMargin;
        } else {
            anchorBox.points.getItem(0).x = x1 + _uiSizes.anchor.boxMargin;
            anchorBox.points.getItem(1).x = x1 - _uiSizes.anchor.boxMargin;
            anchorBox.points.getItem(2).x = x2 - _uiSizes.anchor.boxMargin;
            anchorBox.points.getItem(3).x = x2 + _uiSizes.anchor.boxMargin;
        }
        anchorTarget.setAttribute("x", parseFloat(anchorTarget.attributes.x.nodeValue) + deltaX);
        anchorTarget.setAttribute("y", parseFloat(anchorTarget.attributes.y.nodeValue) + deltaY);
    }

    function _dragEditNoteMarkup (anchorTarget, markupTarget, deltaX, deltaY) {
        var parsedAnno = _pdfParsedAnnotationSet[parseInt(anchorTarget.dataset.annoid)];
        var annoId = parsedAnno.id;
        var anchorBox = document.getElementById("PdfMarkupAnchorBox" + annoId);
        switch (anchorTarget.id) {
            case "PdfMarkupAnchorL" + annoId:
                _repositionNoteLeaderLine(anchorTarget, markupTarget, deltaX, deltaY, parsedAnno);
                break;
            case "PdfMarkupAnchorE" + annoId:
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                break;
            case "PdfMarkupAnchorW" + annoId:
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                break;
            case "PdfMarkupAnchorN" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                break
            case "PdfMarkupAnchorS" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                break
            case "PdfMarkupAnchorNE" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                break
            case "PdfMarkupAnchorNW" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                break
            case "PdfMarkupAnchorSE" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                break
            case "PdfMarkupAnchorSW" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.attributes.y.nodeValue);
                document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.attributes.x.nodeValue);
                break
            default:
                break;
        }
    }

    function _dragEditNoteHorizontalAnchor (markupTarget, anchorTarget, deltaX, parsedAnno, anchorLetter) {
        var newWidth;
        var annoId = parsedAnno.id;
        if (anchorLetter == "W") {
            newWidth = parseFloat(markupTarget.attributes.width.nodeValue) - deltaX;
        } else {
            newWidth = parseFloat(markupTarget.attributes.width.nodeValue) + deltaX;
        }
        var textSpan = markupTarget.parentNode.childNodes[markupTarget.parentNode.childNodes.length - 1];
        if (newWidth > textSpan.getBoundingClientRect().width + (2 * __ZOOMSCALE) || newWidth > parseInt(markupTarget.attributes.width.nodeValue)) {
            if (anchorLetter == "W") {
                markupTarget.setAttribute("x",  parseFloat(markupTarget.attributes.x.nodeValue) + deltaX);
                document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("x", markupTarget.attributes.x.nodeValue);
                textSpan.setAttribute("x", parseFloat(textSpan.attributes.x.nodeValue) + deltaX);
                for (var i = 0; i < textSpan.childNodes.length; i++) {
                    textSpan.childNodes[i].setAttribute("x", parseFloat(textSpan.childNodes[i].attributes.x.nodeValue) + deltaX);
                }
            }
            markupTarget.setAttribute("width",  newWidth);
            anchorTarget.setAttribute("x",  parseFloat(anchorTarget.attributes.x.nodeValue) + deltaX);
            document.getElementById("PdfMarkupAnchorN" + anchorLetter + annoId).setAttribute("x",  anchorTarget.attributes.x.nodeValue);
            document.getElementById("PdfMarkupAnchorS" + anchorLetter + annoId).setAttribute("x",  anchorTarget.attributes.x.nodeValue);
            document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("x", parseFloat(document.getElementById("PdfMarkupAnchorN" + annoId).attributes.x.nodeValue) + (deltaX/2));
            document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("x", document.getElementById("PdfMarkupAnchorN" + annoId).attributes.x.nodeValue);
            document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("width", newWidth);
            if (parsedAnno.leaderLineVertices.length > 0) {
                var leaderLine = markupTarget.parentNode.childNodes[0];
                var leaderArray = leaderLine.attributes.d.nodeValue.split(" L");
                leaderArray[0] = leaderArray[0].substr(1);
                leaderArray = leaderArray.map(function(x){ return x.trim().split(" "); });
                leaderArray = leaderArray.map(function(x){ return [parseFloat(x[0]), parseFloat(x[1])]; });
                if (parsedAnno.leaderLineVertices[2] == parsedAnno.leaderLineVertices[4]) {
                    leaderArray[1][0] += (deltaX / 2);
                    leaderArray[2][0] += (deltaX / 2);
                    parsedAnno.leaderLineVertices[2] += (deltaX / 2) / __ZOOMSCALE;
                    parsedAnno.leaderLineVertices[4] += (deltaX / 2) / __ZOOMSCALE;
                } else {
                    if ((anchorLetter == "W" && parsedAnno.leaderLineVertices[2] < parsedAnno.leaderLineVertices[4]) ||
                        (anchorLetter == "E" && parsedAnno.leaderLineVertices[2] > parsedAnno.leaderLineVertices[4])) {
                            leaderArray[1][0] += deltaX;
                            leaderArray[2][0] += deltaX;
                            parsedAnno.leaderLineVertices[2] += deltaX / __ZOOMSCALE;
                            parsedAnno.leaderLineVertices[4] += deltaX / __ZOOMSCALE;
                    }
                }
                var newPath = "M" + leaderArray[0][0] + " " + leaderArray[0][1] + " L" + leaderArray[1][0] + " " + leaderArray[1][1] + " L" + leaderArray[2][0] + " " + leaderArray[2][1];
                leaderLine.setAttribute("d", newPath);
            }
            var pageHeight = parseFloat(document.getElementById("PdfAnnotationCanvas" + parsedAnno.pageNo).clientHeight);
            parsedAnno.boundingBox = _getNewNoteBoundingBox(markupTarget, pageHeight, parsedAnno);

            //update text clip path
            var textClipPath = document.getElementById("textAnnoClipPath" + annoId).firstChild;
            var x1 = parseInt(markupTarget.attributes.x.nodeValue);
            var y1 = parseInt(markupTarget.attributes.y.nodeValue);
            var x2 = parseInt(markupTarget.attributes.x.nodeValue) + parseInt(markupTarget.attributes.width.nodeValue);
            var y2 = parseInt(markupTarget.attributes.y.nodeValue) + parseInt(markupTarget.attributes.height.nodeValue);
            var newTextClipPath = "M" + x1 + "," + y1 +
                                 " L" + x2 + "," + y1 +
                                 " L" + x2 + "," + y2 +
                                 " L" + x1 + "," + y2 +
                                 " L" + x1 + "," + y1;
            textClipPath.setAttribute("d", newTextClipPath);
            //update box diffs
            if (parsedAnno.leaderLineVertices.length > 0) {
                var dx1 = Math.abs(parsedAnno.boundingBox[0] - (x1 / __ZOOMSCALE));
                var dy1 = Math.abs(parsedAnno.boundingBox[3] - ((pageHeight - y2) / __ZOOMSCALE));
                var dx2 = Math.abs(parsedAnno.boundingBox[2] - (x2 / __ZOOMSCALE));
                var dy2 = Math.abs(parsedAnno.boundingBox[1] - ((pageHeight - y1)/ __ZOOMSCALE));
                parsedAnno.boxDiffs = [dx1, dy1, dx2, dy2];
            }
        }
    }

    function _dragEditNoteVerticalAnchor (markupTarget, anchorTarget, deltaY, parsedAnno, anchorLetter) {
        var newHeight;
        var annoId = parsedAnno.id;
        if (anchorLetter == "N") {
            newHeight = parseFloat(markupTarget.attributes.height.nodeValue) - deltaY;
        } else {
            newHeight = parseFloat(markupTarget.attributes.height.nodeValue) + deltaY;
        }
        var textSpan = markupTarget.parentNode.childNodes[markupTarget.parentNode.childNodes.length - 1];
        if (newHeight > textSpan.getBoundingClientRect().height + (2 * __ZOOMSCALE) || newHeight > parseInt(markupTarget.attributes.height.nodeValue)) {
            if (anchorLetter == "N") {
                markupTarget.setAttribute("y",  parseFloat(markupTarget.attributes.y.nodeValue) + deltaY);
                document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id).setAttribute("y", markupTarget.attributes.y.nodeValue);
                textSpan.setAttribute("y", parseFloat(textSpan.attributes.y.nodeValue) + deltaY);
                for (var i = 0; i < textSpan.childNodes.length; i++) {
                    textSpan.childNodes[i].setAttribute("y", parseFloat(textSpan.childNodes[i].attributes.y.nodeValue) + deltaY);
                }
            }
            markupTarget.setAttribute("height",  newHeight);
            anchorTarget.setAttribute("y",  parseFloat(anchorTarget.attributes.y.nodeValue) + deltaY);
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "E" + annoId).setAttribute("y",  anchorTarget.attributes.y.nodeValue);
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "W" + annoId).setAttribute("y",  anchorTarget.attributes.y.nodeValue);
            document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("y", parseFloat(document.getElementById("PdfMarkupAnchorE" + annoId).attributes.y.nodeValue) + (deltaY/2));
            document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("y", document.getElementById("PdfMarkupAnchorE" + annoId).attributes.y.nodeValue);
            document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("height", newHeight);

            if (parsedAnno.leaderLineVertices.length > 0) {
                var leaderLine = markupTarget.parentNode.childNodes[0];
                var leaderArray = leaderLine.attributes.d.nodeValue.split(" L");
                leaderArray[0] = leaderArray[0].substr(1);
                leaderArray = leaderArray.map(function(x){ return x.trim().split(" "); });
                leaderArray = leaderArray.map(function(x){ return [parseFloat(x[0]), parseFloat(x[1])]; });
                if (parsedAnno.leaderLineVertices[2] == parsedAnno.leaderLineVertices[4]) {
                    //lines on the vertical
                    if ((parsedAnno.leaderLineVertices[3] < parsedAnno.leaderLineVertices[5] && anchorLetter == "S") ||
                        (parsedAnno.leaderLineVertices[3] > parsedAnno.leaderLineVertices[5] && anchorLetter == "N")) {
                        leaderArray[1][1] += deltaY;
                        leaderArray[2][1] += deltaY;
                        parsedAnno.leaderLineVertices[3] -= deltaY / __ZOOMSCALE;
                        parsedAnno.leaderLineVertices[5] -= deltaY / __ZOOMSCALE;
                    }
                } else {
                    //lines on the horizontal
                    leaderArray[1][1] += deltaY / 2;
                    leaderArray[2][1] += deltaY / 2;
                    parsedAnno.leaderLineVertices[3] -= deltaY / 2 / __ZOOMSCALE;
                    parsedAnno.leaderLineVertices[5] -= deltaY / 2 / __ZOOMSCALE;
                }
                var newPath = "M" + leaderArray[0][0] + " " + leaderArray[0][1] + " L" + leaderArray[1][0] + " " + leaderArray[1][1] + " L" + leaderArray[2][0] + " " + leaderArray[2][1];
                leaderLine.setAttribute("d", newPath);
            }

            var pageHeight = parseFloat(document.getElementById("PdfAnnotationCanvas" + parsedAnno.pageNo).clientHeight);
            parsedAnno.boundingBox = _getNewNoteBoundingBox(markupTarget, pageHeight, parsedAnno);
            var textClipPath = document.getElementById("textAnnoClipPath" + annoId).firstChild;
            var x1 = parseInt(markupTarget.attributes.x.nodeValue);
            var y1 = parseInt(markupTarget.attributes.y.nodeValue);
            var x2 = parseInt(markupTarget.attributes.x.nodeValue) + parseInt(markupTarget.attributes.width.nodeValue);
            var y2 = parseInt(markupTarget.attributes.y.nodeValue) + parseInt(markupTarget.attributes.height.nodeValue);
            var newTextClipPath = "M" + x1 + "," + y1 +
                                 " L" + x2 + "," + y1 +
                                 " L" + x2 + "," + y2 +
                                 " L" + x1 + "," + y2 +
                                 " L" + x1 + "," + y1;
            textClipPath.setAttribute("d", newTextClipPath);
            //update box diffs
            if (parsedAnno.leaderLineVertices.length > 0) {
                var dx1 = Math.abs(parsedAnno.boundingBox[0] - (x1 / __ZOOMSCALE));
                var dy1 = Math.abs(parsedAnno.boundingBox[3] - ((pageHeight - y2) / __ZOOMSCALE));
                var dx2 = Math.abs(parsedAnno.boundingBox[2] - (x2 / __ZOOMSCALE));
                var dy2 = Math.abs(parsedAnno.boundingBox[1] - ((pageHeight - y1)/ __ZOOMSCALE));
                parsedAnno.boxDiffs = [dx1, dy1, dx2, dy2];
            }
        }
    }

    function _repositionNoteLeaderLine (anchorTarget, markupTarget, deltaX, deltaY, parsedAnno) {
        var pageHeight = parseFloat(document.getElementById("PdfAnnotationCanvas" + parsedAnno.pageNo).clientHeight);
        var svgObj = markupTarget.parentNode;
        var leaderLine = svgObj.childNodes[0];
        var leaderArray = leaderLine.attributes.d.nodeValue.split(" L");
        leaderArray[0] = leaderArray[0].substr(1).trim();
        leaderArray = leaderArray.map(function(x){ return x.trim().split(" "); });
        leaderArray = leaderArray.map(function(x){ return [parseFloat(x[0].trim()), parseFloat(x[1].trim())]; });
        leaderArray[0][0] += deltaX;
        leaderArray[0][1] += deltaY;
        parsedAnno.leaderLineVertices[0] += (deltaX / __ZOOMSCALE);
        parsedAnno.leaderLineVertices[1] -= (deltaY / __ZOOMSCALE);

        var x0 = parseFloat(markupTarget.attributes.x.nodeValue) + (parseFloat(markupTarget.attributes.width.nodeValue) / 2);
        var y0 = parseFloat(markupTarget.attributes.y.nodeValue) + (parseFloat(markupTarget.attributes.height.nodeValue) / 2);

        var theta = Math.atan2(y0 - leaderArray[0][1], x0 - leaderArray[0][0]) * (180 / Math.PI);
        var axisSwitched = false;
        if (leaderArray[1][0] == leaderArray[2][0]) {
            if (leaderArray[1][1] > leaderArray[2][1]) {
                if (theta < -112.5) {
                    leaderArray[2][0] = parseFloat(markupTarget.attributes.x.nodeValue) + parseFloat(markupTarget.attributes.width.nodeValue);
                    leaderArray[2][1] = parseFloat(markupTarget.attributes.y.nodeValue) + (parseFloat(markupTarget.attributes.height.nodeValue) / 2);
                    leaderArray[1][0] = leaderArray[2][0] + (12 * __ZOOMSCALE);
                    leaderArray[1][1] = leaderArray[2][1];
                    axisSwitched = true;
                } else if (theta > -67.5){
                    leaderArray[2][0] = parseFloat(markupTarget.attributes.x.nodeValue);
                    leaderArray[2][1] = parseFloat(markupTarget.attributes.y.nodeValue) + (parseFloat(markupTarget.attributes.height.nodeValue) / 2);
                    leaderArray[1][0] = leaderArray[2][0] - (12 * __ZOOMSCALE);
                    leaderArray[1][1] = leaderArray[2][1];
                    axisSwitched = true;
                }
            } else {
                if (theta < 67.5) {
                    leaderArray[2][0] = parseFloat(markupTarget.attributes.x.nodeValue);
                    leaderArray[2][1] = parseFloat(markupTarget.attributes.y.nodeValue) + (parseFloat(markupTarget.attributes.height.nodeValue) / 2);
                    leaderArray[1][0] = leaderArray[2][0] - (12 * __ZOOMSCALE);
                    leaderArray[1][1] = leaderArray[2][1];
                    axisSwitched = true;
                } else if (theta > 112.5) {
                    leaderArray[2][0] = parseFloat(markupTarget.attributes.x.nodeValue) + parseFloat(markupTarget.attributes.width.nodeValue);
                    leaderArray[2][1] = parseFloat(markupTarget.attributes.y.nodeValue) + (parseFloat(markupTarget.attributes.height.nodeValue) / 2);
                    leaderArray[1][0] = leaderArray[2][0] + (12 * __ZOOMSCALE);
                    leaderArray[1][1] = leaderArray[2][1];
                    axisSwitched = true;
                }
            }
        } else if (leaderArray[1][0] < leaderArray[2][0]) {
            if (theta > 67.5) {
                leaderArray[2][0] = parseFloat(markupTarget.attributes.x.nodeValue) + (parseFloat(markupTarget.attributes.width.nodeValue) / 2);
                leaderArray[2][1] = parseFloat(markupTarget.attributes.y.nodeValue);
                leaderArray[1][0] = leaderArray[2][0];
                leaderArray[1][1] = leaderArray[2][1] - (12 * __ZOOMSCALE);
                axisSwitched = true;
            } else if (theta < -67.5) {
                leaderArray[2][0] = parseFloat(markupTarget.attributes.x.nodeValue) + (parseFloat(markupTarget.attributes.width.nodeValue) / 2);
                leaderArray[2][1] = parseFloat(markupTarget.attributes.y.nodeValue) + parseFloat(markupTarget.attributes.height.nodeValue);
                leaderArray[1][0] = leaderArray[2][0];
                leaderArray[1][1] = leaderArray[2][1] + (12 * __ZOOMSCALE);
                axisSwitched = true;
            }
        } else {
            if (theta > 90 && theta < 112.5) {
                leaderArray[2][0] = parseFloat(markupTarget.attributes.x.nodeValue) + (parseFloat(markupTarget.attributes.width.nodeValue) / 2);
                leaderArray[2][1] = parseFloat(markupTarget.attributes.y.nodeValue);
                leaderArray[1][0] = leaderArray[2][0];
                leaderArray[1][1] = leaderArray[2][1] - (12 * __ZOOMSCALE);
                axisSwitched = true;
            } else if (theta < -90 && theta > -112.5) {
                leaderArray[2][0] = parseFloat(markupTarget.attributes.x.nodeValue) + (parseFloat(markupTarget.attributes.width.nodeValue) / 2);
                leaderArray[2][1] = parseFloat(markupTarget.attributes.y.nodeValue) + parseFloat(markupTarget.attributes.height.nodeValue);
                leaderArray[1][0] = leaderArray[2][0];
                leaderArray[1][1] = leaderArray[2][1] + (12 * __ZOOMSCALE);
                axisSwitched = true;
            }
        }

        if (axisSwitched) {
            parsedAnno.leaderLineVertices[2] = (leaderArray[1][0] / __ZOOMSCALE);
            parsedAnno.leaderLineVertices[3] = ((pageHeight - leaderArray[1][1]) / __ZOOMSCALE);
            parsedAnno.leaderLineVertices[4] = (leaderArray[2][0] / __ZOOMSCALE);
            parsedAnno.leaderLineVertices[5] = ((pageHeight - leaderArray[2][1]) / __ZOOMSCALE);
        }

        var newPath = "M" + leaderArray[0][0] + " " + leaderArray[0][1] + " L" + leaderArray[1][0] + " " + leaderArray[1][1] + " L" + leaderArray[2][0] + " " + leaderArray[2][1];
        leaderLine.setAttribute("d", newPath);

        parsedAnno.boundingBox = _getNewNoteBoundingBox(markupTarget, pageHeight, parsedAnno);

        anchorTarget.setAttribute("x", parseFloat(anchorTarget.attributes.x.nodeValue) + deltaX);
        anchorTarget.setAttribute("y", parseFloat(anchorTarget.attributes.y.nodeValue) + deltaY);
        //update box diffs
        if (parsedAnno.leaderLineVertices.length > 0) {
            var x1 = parseInt(markupTarget.attributes.x.nodeValue);
            var y1 = parseInt(markupTarget.attributes.y.nodeValue);
            var x2 = parseInt(markupTarget.attributes.x.nodeValue) + parseInt(markupTarget.attributes.width.nodeValue);
            var y2 = parseInt(markupTarget.attributes.y.nodeValue) + parseInt(markupTarget.attributes.height.nodeValue);
            var dx1 = Math.abs(parsedAnno.boundingBox[0] - (x1 / __ZOOMSCALE));
            var dy1 = Math.abs(parsedAnno.boundingBox[3] - ((pageHeight - y2) / __ZOOMSCALE));
            var dx2 = Math.abs(parsedAnno.boundingBox[2] - (x2 / __ZOOMSCALE));
            var dy2 = Math.abs(parsedAnno.boundingBox[1] - ((pageHeight - y1)/ __ZOOMSCALE));
            parsedAnno.boxDiffs = [dx1, dy1, dx2, dy2];
        }
    }

    function _getNewNoteBoundingBox (markupTarget, pageHeight, parsedAnno) {
        var bx1 = parseFloat(markupTarget.attributes.x.nodeValue) / __ZOOMSCALE;
        var by1 = (pageHeight - parseFloat(markupTarget.attributes.y.nodeValue)) / __ZOOMSCALE;
        var bx2 = (parseFloat(markupTarget.attributes.x.nodeValue) + parseFloat(markupTarget.attributes.width.nodeValue)) / __ZOOMSCALE;
        var by2 = (pageHeight - (parseFloat(markupTarget.attributes.y.nodeValue) + parseFloat(markupTarget.attributes.height.nodeValue))) / __ZOOMSCALE;

        if (parsedAnno.leaderLineVertices && parsedAnno.leaderLineVertices.length == 6) {
            bx1 = Math.min(bx1, parsedAnno.leaderLineVertices[0], parsedAnno.leaderLineVertices[2], parsedAnno.leaderLineVertices[4]);
            by1 = Math.max(by1, parsedAnno.leaderLineVertices[1], parsedAnno.leaderLineVertices[3], parsedAnno.leaderLineVertices[5]);
            bx2 = Math.max(bx2, parsedAnno.leaderLineVertices[0], parsedAnno.leaderLineVertices[2], parsedAnno.leaderLineVertices[4]);
            by2 = Math.min(by2, parsedAnno.leaderLineVertices[1], parsedAnno.leaderLineVertices[3], parsedAnno.leaderLineVertices[5]);
        }

        return [bx1, by1, bx2, by2];
    }

    function _handleNoteEditTextEvent (e) {
        if (_checkPageRotation() != 0) {
            return;
        }
        switch (e.type) {
            case "dblclick":
                var annoId = parseInt(e.target.dataset.annoid);
                var markupTarget = document.getElementById("PdfAnnotationElement" + annoId);
                var parsedAnno = _pdfParsedAnnotationSet[annoId];
                if (markupTarget && parsedAnno && (parsedAnno.type == _markupTypes.note || parsedAnno.type == _markupTypes.noteLeader)) {
                    _markupEdit.edit = true;
                    _markupEdit.idNo = annoId;
                    _createNoteEditCanvas(markupTarget, parsedAnno);
                }
                break;
            default:
                break;
        }
    }

    function _createNoteEditCanvas (markupTarget, parsedAnno) {
        var anchorBox = document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id);
        var anchorGroup;
        if (anchorBox) {
            anchorGroup = anchorBox.parentNode;
            anchorGroup.style.display = "none";
        }

        _createDynamicNoteCanvas(parsedAnno.pageNo + 1);
        var dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + (parsedAnno.pageNo + 1));
        var x = parseFloat(markupTarget.attributes.x.nodeValue) - (2 * __ZOOMSCALE);
        var y = parseFloat(markupTarget.attributes.y.nodeValue) - (2 * __ZOOMSCALE);
        var width = parseFloat(markupTarget.attributes.width.nodeValue) - (2 * __ZOOMSCALE);
        var height = parseFloat(markupTarget.attributes.height.nodeValue) - (2 * __ZOOMSCALE);


        var editableDiv = document.createElement("div");
        editableDiv.id = "PdfMarkupNoteEditor";
        editableDiv.className = "PdfMarkupNoteEditor";
        editableDiv.dataset.annoid = parsedAnno.id;
        var style = "display:inline-block; position: absolute; left:" + x + "px; top:" + y + "px; min-height:" + height + "px; min-width:" + width + "px; max-width:" + width + "px;";
        style += " font-family:" + parsedAnno.fontFamily + "; color:" + parsedAnno.fontColor + "; font-size:" + (parsedAnno.fontSize * __ZOOMSCALE) + "px; text-align:" + parsedAnno.textAlignment + "; background-color:" + _uiColors.markup.white + ";";
        style += " border:" + 2 * __ZOOMSCALE + "px solid " + _uiColors.markup.line + "; padding:" + (2 * __ZOOMSCALE) + "px; white-space: pre-wrap";
        editableDiv.setAttribute("style", style);
        var editableP = document.createElement("p");
        editableP.id = "PdfMarkupNoteEditorP";
        editableP.className = "PdfMarkupNoteEditor";
        editableP.dataset.annoid = parsedAnno.id;
        editableP.setAttribute("contentEditable", "true");
        editableP.setAttribute("style", "min-height: " + height + "px; min-width:" + width + "px; word-wrap: break-word; margin: 0px;");
        editableP.innerHTML = parsedAnno.content;
        editableDiv.appendChild(editableP);

        dynamicCanvas.appendChild(editableDiv);

        dynamicCanvas.addEventListener("mousedown", _checkExitNoteEdit);
        dynamicCanvas.addEventListener("keydown", _checkExitNoteEdit);

        editableP.focus();
    }

    function _checkExitNoteEdit (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        switch(e.type) {
            case "mousedown":
                if (e.target.id != "PdfMarkupNoteEditor" && e.target.id != "PdfMarkupNoteEditorP") {
                    _confirmNoteChanges();
                }
                break;
            case "keydown":
                if (e.key == "Escape") {
                    _confirmNoteChanges();
                } else if (e.key == "Delete" ||
                           e.key == "Home" || e.key == "End" ||
                           e.key == "PageUp" || e.key == "PageDown" ||
                           e.key == "ArrowUp" || e.key == "ArrowDown" ||
                           e.key == "ArrowLeft" || e.key == "ArrowRight") {
                    e.stopPropagation();
                }
                break;
            default:
                break;
        }
    }

    function _confirmNoteChanges () {
        _markupEdit.edit = false;
        var editableDiv = document.getElementById("PdfMarkupNoteEditor");
        if (!editableDiv || _markupEdit.idNo < 0 || _markupEdit.idNo >= _pdfParsedAnnotationSet.length) {
            return;
        }
        var editableP = editableDiv.firstChild;

        var parsedAnno = _pdfParsedAnnotationSet[_markupEdit.idNo];
        var markupTarget = document.getElementById("PdfAnnotationElement" + _markupEdit.idNo);

        if (!editableP || !parsedAnno || !markupTarget) {
            return;
        }

        _pushActionToMarkupHistory(_undoPresets.noteEdit, _markupEdit.idNo, parsedAnno);

        var extractedNodes = editableP.childNodes;
        var extractedContent = "";
        if (extractedNodes.length > 0) {
            extractedContent = encodeContent(extractedNodes[0].textContent);
            for (var i = 1; i < extractedNodes.length; i++) {
                extractedContent += "\n" + encodeContent(extractedNodes[i].textContent);
            }
            extractedContent = extractedContent.replace(/\s+$/, "");
        }

        parsedAnno.content = extractedContent;

        editableP.style.maxHeight = 'none';
        editableP.style.minHeight = '0px';

        var pageHeight = parseFloat(document.getElementById("PdfAnnotationCanvas" + parsedAnno.pageNo).clientHeight);

        var bx1 = parseFloat(markupTarget.attributes.x.nodeValue) / __ZOOMSCALE;
        var by1 = (pageHeight - parseFloat(markupTarget.attributes.y.nodeValue)) / __ZOOMSCALE;
        var bx2 = bx1 + parseFloat(markupTarget.attributes.width.nodeValue) / __ZOOMSCALE;
        var by2 = by1 - parseFloat(editableDiv.clientHeight) / __ZOOMSCALE + 2;

        //leaderline
        if (parsedAnno.leaderLineVertices.length > 0) {
            if (parsedAnno.leaderLineVertices[2] == parsedAnno.leaderLineVertices[4]) {
                //vertical
                if (parsedAnno.leaderLineVertices[3] < parsedAnno.leaderLineVertices[5]) {
                    //below
                    parsedAnno.leaderLineVertices[5] = by2;
                    parsedAnno.leaderLineVertices[3] = by2 - 12;
                }
            } else {
                //horizontal
                parsedAnno.leaderLineVertices[5] = (by1 + by2) / 2;
                parsedAnno.leaderLineVertices[3] = parsedAnno.leaderLineVertices[5];
            }
            var arrX = [bx1, bx2, parsedAnno.leaderLineVertices[0], parsedAnno.leaderLineVertices[2], parsedAnno.leaderLineVertices[4]];
            var arrY = [by1, by2, parsedAnno.leaderLineVertices[1], parsedAnno.leaderLineVertices[3], parsedAnno.leaderLineVertices[5]];

            //boundingbox
            bx1 = Math.min.apply(Math, arrX);
            by1 = Math.max.apply(Math, arrY);
            bx2 = Math.max.apply(Math, arrX);
            by2 = Math.min.apply(Math, arrY);
        }

        parsedAnno.boundingBox = [bx1, by1, bx2, by2];

        //update box diffs
        if (parsedAnno.leaderLineVertices.length > 0) {
            var x1 = parseFloat(markupTarget.attributes.x.nodeValue) / __ZOOMSCALE;
            var y1 = (pageHeight - parseFloat(markupTarget.attributes.y.nodeValue)) / __ZOOMSCALE;
            var x2 = x1 + parseFloat(markupTarget.attributes.width.nodeValue) / __ZOOMSCALE;
            var y2 = y1 - parseFloat(editableDiv.clientHeight) / __ZOOMSCALE + 2;
            var dx1 = Math.abs(parsedAnno.boundingBox[0] - x1);
            var dy1 = Math.abs(parsedAnno.boundingBox[3] - y2);
            var dx2 = Math.abs(parsedAnno.boundingBox[2] - x2);
            var dy2 = Math.abs(parsedAnno.boundingBox[1] - y1);
            parsedAnno.boxDiffs = [dx1, dy1, dx2, dy2];
        }

        editableDiv.parentNode.parentNode.removeChild(editableDiv.parentNode);

        _redrawPdfAnnotationPage(parsedAnno.pageNo);
        _markupObserver.set("annoSetEdited");
    }

    function _setMarkupEditCursor (target) {
        var currentCanvas = document.getElementById(_currentCanvasId);
        if (_checkPageRotation() != 0) {
            currentCanvas.style.cursor = "auto";
            return;
        }
        var annoId = target.dataset.annoid;
        switch (target.id) {
            case "PdfMarkupAnchorNW" + annoId:
            case "PdfMarkupAnchorSE" + annoId:
                currentCanvas.style.cursor = "nw-resize";
                break;
            case "PdfMarkupAnchorNE" + annoId:
            case "PdfMarkupAnchorSW" + annoId:
                currentCanvas.style.cursor = "ne-resize";
                break;
            case "PdfMarkupAnchorN" + annoId:
            case "PdfMarkupAnchorS" + annoId:
                currentCanvas.style.cursor = "n-resize";
                break;
            case "PdfMarkupAnchorE" + annoId:
            case "PdfMarkupAnchorW" + annoId:
                currentCanvas.style.cursor = "e-resize";
                break;
            case "PdfMarkupAnchorL" + annoId:
                currentCanvas.style.cursor = "move";
                break;
            default :
                currentCanvas.style.cursor = "auto";
                break;
        }
    }

    function _removeAnchorPoints (target) {
        target.parentNode.removeChild(target.parentNode.childNodes[1]);
        target.parentNode.parentNode.removeEventListener("mousemove", _handleShapeMarkupEditEvent);
        target.parentNode.parentNode.removeEventListener("mouseup", _handleShapeMarkupEditEvent);
    }

    function _highlightPdfAnnotationShape(markup, rgb) {
        markup.style.stroke = rgb;
    }

    function _handleDeletePdfAnnoAPI (idNo) {
        var anno = document.getElementById("PdfAnnotationElement" + idNo);
        if (anno && anno.dataset.selected == "true") {
            _deselectPdfAnnotation(anno);
        }
        _deletePdfAnnotationByIdWrapper(parseInt(idNo));
        _markupObserver.set("annoSetEdited");
    }

    function _deleteSelectedPdfAnnotations () {
        if (_markupMode.selectedAnnotations.length > 0) {
            for (var i = 0; i < _markupMode.selectedAnnotations.length; i++) {
                var markup = _markupMode.selectedAnnotations[i];
                if (markup) {
                    var annoId = parseInt(markup.dataset.annoid);
                    if (annoId != null) {
                        var anchorNorth = document.getElementById("PdfMarkupAnchorN" + annoId);
                        if (anchorNorth) {
                            anchorNorth.parentNode.parentNode.removeChild(anchorNorth.parentNode);
                        }
                        _deletePdfAnnotationByIdWrapper(annoId);
                    }
                }
            }
            _markupMode.selectedAnnotations = [];
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            _markupObserver.set("annoSetEdited");
        }
    }

    function _deletePdfAnnotationByIdWrapper (idNo){
        if (idNo == null || idNo == -1) {
            return;
        }
        var parsedAnno = _pdfParsedAnnotationSet[idNo];
        if (parsedAnno.visible) {
            _deletePdfAnnotationById(parsedAnno)
        }
        var pageNo = parsedAnno.pageNo + 1;
        _pushActionToMarkupHistory(_undoPresets.delete, idNo, parsedAnno);
        _pdfParsedAnnotationSet[idNo] = null;
        _pageAnnoSetList[pageNo].splice(_pageAnnoSetList[pageNo].indexOf(idNo), 1);
        _markupObserver.set("annoDeleted", idNo);
    }

    function _deletePdfAnnotationById (parsedAnno){
        var anno = document.getElementById("PdfAnnotationElement" + parsedAnno.id);
        if (anno && parsedAnno) {
            var pageNo = parsedAnno.pageNo + 1;
            var textLayer = document.getElementById("PdfPageDisplayTextLayer" + pageNo);
            if (textLayer) {
                textLayer.style.zIndex = 3;
            }
            if (anno.parentNode.tagName == "svg") {
                anno.parentNode.removeChild(anno);
            } else {
                anno.parentNode.parentNode.removeChild(anno.parentNode);
            }
            return true;
        }
        return false;
    }

//PDF SAVE FDF

    function _GetLoadedPdfAnnotationSetFdf (docScene, author, filePath, callback) {
        if (_pdfParsedAnnotationSet && _pdfParsedAnnotationSet.length > 0) {
            var deparsedAnnoSet = _buildUnparsedAnnotationSet(_pdfParsedAnnotationSet);
            if (!author) {
                author = "";
            }
            if (!filePath) {
                filePath = "";
            }
            filePath = encodePathContent(filePath);
            if (deparsedAnnoSet.size() > 0) {
                docScene.GetFdfBufferfromPdfAnnotations(deparsedAnnoSet, author, filePath, function(buffer, errors){
                    if (callback) {
                        callback(buffer);
                    }
                });
            } else {
                if (callback)
                    callback("");
            }
        }
    }

    function _buildUnparsedAnnotationSet (annoSet) {
        if (!annoSet) {
            return;
        }
        var deparsedAnnoSet = new Module.PdfAnnotationSetVec();
        for (var i = 0; i < annoSet.length; i++) {
            if (annoSet[i] != null) {
                var deparsedAnno = null;
                switch (annoSet[i].type) {
                    case _markupTypes.leaderLine:
                    case _markupTypes.leaderLineHeadTail:
                    case _markupTypes.polyline:
                    case _markupTypes.polyLineHeadTail:
                        deparsedAnno = _unparseLeaderLineMarkup(annoSet[i]);
                        break;
                    case _markupTypes.rectangle:
                    case _markupTypes.rectangleFilled:
                    case _markupTypes.ellipse :
                    case _markupTypes.ellipseFilled :
                        deparsedAnno = _unparseShapeMarkup(annoSet[i]);
                        break;
                    case _markupTypes.polygon :
                    case _markupTypes.polygonFilled :
                        deparsedAnno = _unparsePolygonMarkup(annoSet[i]);
                        break;
                    case _markupTypes.textHighlight:
                    case _markupTypes.textStrikethrough:
                    case _markupTypes.textUnderline:
                    case _markupTypes.freehand:
                        deparsedAnno = _unparseTextDecorationMarkup(annoSet[i]);
                        break;
                    case _markupTypes.note:
                    case _markupTypes.noteLeader:
                        deparsedAnno = _unparseNoteMarkup(annoSet[i]);
                        break;
                    case _markupTypes.stamp:
                        deparsedAnno = _unparseStampMarkup(annoSet[i]);
                        break;
                    default:
                        break;
                }
                if (deparsedAnno) {
                    deparsedAnnoSet.push_back(deparsedAnno);
                }
            }
        }
        return deparsedAnnoSet;
    }

    function _unparseMarkupTypeName (type) {
        switch (type) {
            case _markupTypes.note :
            case _markupTypes.noteLeader :
                return "Note"
            case _markupTypes.leaderLine :
            case _markupTypes.leaderLineHeadTail :
                return "LeaderLine";
            case _markupTypes.polyline :
            case _markupTypes.polyLineHeadTail :
                return "PolyLine";
            case _markupTypes.rectangle :
            case _markupTypes.rectangleFilled :
                return "Rectangle";
            case _markupTypes.ellipse :
            case _markupTypes.ellipseFilled :
                return "Circle";
            case _markupTypes.polygon :
            case _markupTypes.polygonFilled :
                return "Polygon";
            case _markupTypes.freehand :
                return "Freehand";
            case _markupTypes.textHighlight :
                return "Highlight";
            case _markupTypes.textStrikethrough :
                return "StrikeThrough";
            case _markupTypes.textUnderline :
                return "Underline";
            case _markupTypes.stamp :
                return "Stamp";
            default :
               return "";
        }
    }

    function _unparseLeaderLineMarkup (markup) {
        var leaderLineObj = {};
        leaderLineObj.type = _unparseMarkupTypeName(markup.type);
        leaderLineObj.pageNo = markup.pageNo;
        var data = "Vertices:";
        for (var i = 0; i < markup.vertices.length; i++) {
            data += " " + markup.vertices[i] + ",";
        }
        data += " Bounding box:";
        for (var j = 0; j < markup.boundingBox.length; j++) {
            data += " " + markup.boundingBox[j] + ",";
        }
        data += " Head: " + markup.head + ",";
        data += " Tail: " + markup.tail + ",";
        data += " Visible: " + markup.visible;
        leaderLineObj.data = data;
        return leaderLineObj;
    }

    function _unparseShapeMarkup (markup) {
        var shapeObj = {};
        shapeObj.type = _unparseMarkupTypeName(markup.type);
        shapeObj.pageNo = markup.pageNo;
        shapeObj.data = "Vertices:";
        for (var i = 0; i < markup.vertices.length; i++) {
            shapeObj.data += " " + markup.vertices[i] + ",";
        }
        shapeObj.data += " Filled: " + markup.filled + ",";
        shapeObj.data += " Visible: " + markup.visible;
        return shapeObj;
    }

    function _unparsePolygonMarkup (markup) {
        var polygonObj = {};
        polygonObj.type = _unparseMarkupTypeName(markup.type);
        polygonObj.pageNo = markup.pageNo;
        polygonObj.data = "Vertices:";
        for (var i = 0; i < markup.vertices.length; i++) {
            polygonObj.data += " " + markup.vertices[i] + ",";
        }
        polygonObj.data += " Bounding box:";
        for (var j = 0; j < markup.boundingBox.length; j++) {
            polygonObj.data += " " + markup.boundingBox[j] + ",";
        }
        polygonObj.data += " Filled: " + markup.filled;
        polygonObj.data += " Visible: " + markup.visible;
        return polygonObj;
    }

    function _unparseTextDecorationMarkup (markup) {
        var textDecoObj = {};
        textDecoObj.type = _unparseMarkupTypeName(markup.type);
        textDecoObj.pageNo = markup.pageNo;
        textDecoObj.data = "Vertices:";
        for (var i = 0; i < markup.vertices.length; i++) {
            textDecoObj.data += " " + markup.vertices[i] + ",";
        }
        textDecoObj.data += " Bounding box:";
        for (var j = 0; j < markup.boundingBox.length; j++) {
            textDecoObj.data += " " + markup.boundingBox[j] + ",";
        }
        textDecoObj.data += " Visible: " + markup.visible;
        return textDecoObj;
    }

    function _unparseNoteMarkup (markup) {
        var noteObj = {};
        noteObj.type = _unparseMarkupTypeName(markup.type);
        noteObj.pageNo = markup.pageNo;
        var orderedBoundingBox = [];
        orderedBoundingBox.push(Math.min(markup.boundingBox[0], markup.boundingBox[2]));
        orderedBoundingBox.push(Math.min(markup.boundingBox[1], markup.boundingBox[3]));
        orderedBoundingBox.push(Math.max(markup.boundingBox[0], markup.boundingBox[2]));
        orderedBoundingBox.push(Math.max(markup.boundingBox[1], markup.boundingBox[3]));
        noteObj.data = "Bounding box: " + orderedBoundingBox[0] + ", " +
                                          orderedBoundingBox[1] + ", " +
                                          orderedBoundingBox[2] + ", " +
                                          orderedBoundingBox[3];
        noteObj.data += ", Content: " + markup.content;
        noteObj.data += ", Font Family: " + markup.fontFamily;
        noteObj.data += ", Text Alignment: " + markup.textAlignment;
        noteObj.data += ", Font Color: " + markup.fontColor;
        noteObj.data += ", Font Size: " + markup.fontSize.toFixed(6);
        noteObj.data += ", Head: " + markup.head;
        if (markup.leaderLineVertices.length > 0) {
            noteObj.data += ", Leader Line Vertices:";
            for (var j = 0; j < markup.leaderLineVertices.length; j++) {
                noteObj.data += " " + markup.leaderLineVertices[j] + ",";
            }
        }
        noteObj.data += ", Visible: " + markup.visible;
        if (markup.leaderLineVertices.length > 0 && markup.boxDiffs.length == 4) {
            noteObj.data += ", Box Diffs:";
            for (var j = 0; j < markup.boxDiffs.length; j++) {
                noteObj.data += " " + markup.boxDiffs[j] + ",";
            }
        }
        return noteObj;
    }

    function _unparseStampMarkup (markup) {
        var stampObj = {};
        stampObj.type = _unparseMarkupTypeName(markup.type);
        stampObj.pageNo = markup.pageNo;
        stampObj.data = "Vertices:";
        for (var i = 0; i < markup.vertices.length; i++) {
            stampObj.data += " " + markup.vertices[i] + ",";
        }
        stampObj.data += " Filter: " + markup.filter;
        stampObj.data += ", Stream Length: " + markup.streamLength;
        stampObj.data += ", Inflated Length: " + markup.inflatedLength;
        stampObj.data += ", Height: " + markup.height;
        stampObj.data += ", Width: " + markup.width;
        stampObj.data += ", Color Space: " + markup.colorSpace;
        stampObj.data += ", Bits Per Component: " + markup.bitsPerComponent;
        stampObj.data += ", Visible: " + markup.visible;
        stampObj.data += ", Inflated Stream: " + markup.stream;
        stampObj.data += ", Raw Stream: " + markup.rawStream;
        return stampObj;
    }

//PDF FILTER MARKUPS

    function _setPdfMarkupsFilter (filterOn) {
        _filterPdfMarkups = filterOn;
        if (_pdfParsedAnnotationSet && _pdfParsedAnnotationSet.length != 0) {
            var markupCanvases = document.getElementsByClassName("PdfAnnotationCanvas");
            var canvasVisibility = _filterPdfMarkups ? "hidden" : "visible";
            for (var i = 0; i < markupCanvases.length; i++) {
                markupCanvases[i].style.visibility = canvasVisibility;
            }
        }
    }

//PDF CREATE MARKUPS

    function _togglePdfMarkupMode (markupType, markupOn, options) {
        if (_markupMode.on) {
            //markup is already on, need to cancel that
            if (_markupMode.type == _markupTypes.note || _markupMode.type == _markupTypes.noteLeader) {
                if (document.getElementById("PdfMarkupNoteCreator")) {
                    _createNoteMarkup();
                }
            }
            _switchMarkupModeType(false, true);
        }
        _markupMode.on = markupOn;
        var annoCanvases = document.getElementsByClassName("PdfAnnotationCanvas");
        if (markupOn) {
            if (_cursor.callback) {
                _cursor.callback(_cursorTypes.markup);
            }
            for (var i = 0; i < annoCanvases.length; i++){
                annoCanvases[i].style.pointerEvents = "none";
            }
        } else {
            for (var i = 0; i < annoCanvases.length; i++){
                annoCanvases[i].style.pointerEvents = "auto";
            }
        }

        if (markupType) {
            _markupMode.type = markupType;
            _switchMarkupModeType(markupOn, false);
        } else {
            _switchMarkupModeType(markupOn, false);
            _markupMode.type = markupType;
        }
    }

    function _switchMarkupModeType (markupOn, suppressCallback) {
        if (_markupMode.type) {
            switch (_markupMode.type) {
                case _markupTypes.note :
                    _setShapeMUCreation(markupOn, _handleCreateNoteEvent, "text", suppressCallback);
                    break;
                case _markupTypes.noteLeader :
                    _setShapeMUCreation(markupOn, _handleCreateNoteLeaderEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.leaderLine :
                case _markupTypes.leaderLineHeadTail :
                    _setShapeMUCreation(markupOn, _handleCreateLeaderLineEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.polyline :
                    //todo
                    break;
                case _markupTypes.polyLineHeadTail :
                    //todo
                    break;
                case _markupTypes.rectangle :
                case _markupTypes.rectangleFilled :
                    _setShapeMUCreation(markupOn, _handleCreateRectangleEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.ellipse :
                case _markupTypes.ellipseFilled :
                    _setShapeMUCreation(markupOn, _handleCreateEllipseEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.polygon :
                    //todo
                    break;
                case _markupTypes.polygonFilled :
                    //todo
                    break;
                case _markupTypes.freehand :
                    _setShapeMUCreation(markupOn, _handleCreateFreehandEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.textHighlight :
                case _markupTypes.textStrikethrough :
                case _markupTypes.textUnderline :
                    _setTextMUCreation(markupOn, _handleCreateTextEvent, suppressCallback);
                    break;
                case _markupTypes.stamp :
                    //todo
                    break;
                default :
                    break;
            }
        }
    }

    function _setShapeMUCreation (creationOn, eventFunction, creationCursor, suppressCallback) {
        var parent = document.getElementById(_currentCanvasId);
        var pages = document.getElementsByClassName("PdfPageDisplayCanvas");
        var textLayers = document.getElementsByClassName("PdfPageDisplayTextLayer");
        if (creationOn) {
            parent.style.cursor = creationCursor;
            for (var j = 0; j < textLayers.length; j++) {
                textLayers[j].style.zIndex = -1;
            }
            for (var i = 0; i < pages.length; i++) {
                pages[i].addEventListener("mousedown", eventFunction);
            }
        } else {
            parent.style.cursor = "auto";
            for (var i = 0; i < pages.length; i++) {
                pages[i].removeEventListener("mousedown", eventFunction);
            }
            for (var j = 0; j < textLayers.length; j++) {
                textLayers[j].style.zIndex = 3;
            }
            if (!suppressCallback) {
                _markupObserver.set("annoModeComplete", _markupMode.type);
            }
        }
    }

    function _setTextMUCreation (creationOn, eventFunction, suppressCallback) {
        var parent = document.getElementById(_currentCanvasId);
        var textLayers = document.getElementsByClassName("PdfPageDisplayTextLayer");
        if (creationOn) {
            for (var j = 0; j < textLayers.length; j++) {
                var muCreationLayer = textLayers[j].cloneNode(true);
                var dynamicPageNo = parseInt(textLayers[j].id.substring(textLayers[j].className.length));
                muCreationLayer.id = "PdfPageDynamicTextMarkupCanvas" + dynamicPageNo;
                muCreationLayer.className = "PdfPageDynamicTextMarkupCanvas";
                for (var k = 0; k < muCreationLayer.childNodes.length; k++) {
                    var textItem = muCreationLayer.childNodes[k];
                    var textItemIdNo = textItem.id.substring(textItem.id.indexOf("_") + 1);
                    textItem.id = "PdfPageDynamicTextLayer" + dynamicPageNo + "_" + textItemIdNo;
                    textItem.className = "PdfPageDynamicTextLayer";
                }
                muCreationLayer.style.userSelect = "text";
                muCreationLayer.style.msUserSelect = "text";
                textLayers[j].parentNode.appendChild(muCreationLayer);
                muCreationLayer.addEventListener("mousedown", eventFunction);
                muCreationLayer.addEventListener("mouseup", eventFunction);
                textLayers[j].style.zIndex = -1;
            }
            var selection = window.getSelection();
            if (selection && !selection.isCollapsed && selection.anchorNode && selection.focusNode &&
                selection.anchorNode.nodeName == "#text" && selection.focusNode.nodeName == "#text") {
                    var parentNode = selection.anchorNode.parentNode.parentNode;
                    var boundingClientRect = parentNode.getBoundingClientRect()
                    var anchorParentBox = selection.anchorNode.parentNode.getBoundingClientRect();
                    var focusParentBox = selection.focusNode.parentNode.getBoundingClientRect();
                    var pageNo = parseInt(parentNode.id.substring(parentNode.className.length));
                    _markupMode.mouse.pageNo = pageNo;

                    _createTextMarkup(selection, _markupMode.type);
            }
        } else {
            for (var j = 0; j < textLayers.length; j++) {
                var pageNo = parseInt(textLayers[j].id.substring(textLayers[j].className.length));
                var dynamicTextLayer = document.getElementById("PdfPageDynamicTextMarkupCanvas" + pageNo);
                if (dynamicTextLayer) {
                    textLayers[j].parentNode.removeChild(dynamicTextLayer);
                }
                textLayers[j].style.zIndex = 3;

            }
            if (!suppressCallback) {
                _markupObserver.set("annoModeComplete", _markupMode.type);
            }
        }
    }

    function _createDynamicMarkupCanvas (pageNo, eventFunction) {
        var pageWrapper = document.getElementById("PdfPageDisplayWrapper" + pageNo);
        var dynamicCanvas = document.createElement("div");
        dynamicCanvas.id = "PdfPageDynamicMarkupCanvas" + pageNo;
        dynamicCanvas.className = "PdfPageDynamicMarkupCanvas";
        dynamicCanvas.height = pageWrapper.height;
        dynamicCanvas.width = pageWrapper.width;
        dynamicCanvas.setAttribute('style', "height: " + pageWrapper.height + "; width: " + pageWrapper.width + "; display: inline-block; position: absolute");
        dynamicCanvas.addEventListener("mousemove", eventFunction, false);
        dynamicCanvas.addEventListener("mouseup", eventFunction, false);
        pageWrapper.insertBefore(dynamicCanvas, pageWrapper.firstChild);
    }

    function _handleCreateRectangleEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        var boundingClientRect;
        e.preventDefault();
        if (e.type == "mousedown") {
            var selectedLength = _markupMode.selectedAnnotations.length;
            for (var i = 0; i < selectedLength; i++) {
                _setPdfAnnotationSelect(_markupMode.selectedAnnotations[0], false);
            }
            var pageNo = parseInt(e.target.id.substring(e.target.className.length));
            _createDynamicMarkupCanvas(pageNo, _handleCreateRectangleEvent);
            _markupMode.mouse.down = true;
            boundingClientRect = e.target.getBoundingClientRect();
            _markupMode.mouse.xStart = e.clientX - boundingClientRect.left;
            _markupMode.mouse.yStart = e.clientY - boundingClientRect.top;
            _markupMode.mouse.pageNo = pageNo;
        } else if (e.type == "mouseup" && _markupMode.mouse.down) {
            e.stopPropagation();
            boundingClientRect = e.target.parentNode.parentNode.getBoundingClientRect();
            _markupMode.mouse.down = false;
            _markupMode.mouse.xEnd = e.clientX - boundingClientRect.left;
            _markupMode.mouse.yEnd = e.clientY - boundingClientRect.top;
            _createRectangleMarkup();
            document.getElementById("PdfPageDisplayWrapper" + _markupMode.mouse.pageNo).removeChild(document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo));
        } else if (e.type == "mousemove" && _markupMode.mouse.down) {
            e.stopPropagation();
            boundingClientRect = e.target.parentNode.parentNode.getBoundingClientRect();
            var x = e.clientX - boundingClientRect.left;
            var y = e.clientY - boundingClientRect.top;
            _drawDynamicRectangleMarkup(x, y);
        }
    }

    function _createRectangleMarkup () {
        var width = Math.abs(_markupMode.mouse.xEnd - _markupMode.mouse.xStart);
        var height = Math.abs(_markupMode.mouse.yEnd - _markupMode.mouse.yStart);
        if (width > 0 && height > 0) {
            var pageHeight = parseInt(document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).clientHeight);
            var x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
            var y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
            var x2 = _markupMode.mouse.xEnd / __ZOOMSCALE;
            var y2 = (pageHeight - _markupMode.mouse.yEnd) / __ZOOMSCALE;
            var filledVal = _markupMode.type.indexOf("Filled") > -1;
            var annotation = {
                type: filledVal ? _markupTypes.rectangleFilled : _markupTypes.rectangle,
                id: _getNextPdfAnnotationId(),
                vertices: [x1, y1, x2, y2],
                pageNo: _markupMode.mouse.pageNo - 1,
                filled: filledVal ? true : false,
                visible: true,
                isNew: true
            };
            var parsedAnnoSet = _pdfParsedAnnotationSet;
            if (!parsedAnnoSet) {
                parsedAnnoSet = [];
            }
            parsedAnnoSet.push(annotation);
            _displayPdfAnnotations(parsedAnnoSet);
            if (!_pageAnnoSetList[_markupMode.mouse.pageNo]) {
                _pageAnnoSetList[_markupMode.mouse.pageNo] = [];
            }
            _pageAnnoSetList[_markupMode.mouse.pageNo].push(_pdfParsedAnnotationSet.length-1);
            _pushActionToMarkupHistory(_undoPresets.create, annotation.id, annotation);
            _markupObserver.set("annoCreated", annotation);
            _markupObserver.set("annoSetEdited");
        }
        returnObj.SetMarkupModePDF(null, false, []);
    }

    function _drawDynamicRectangleMarkup (endX, endY) {
        var pageCanvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
        var pageHeight = parseInt(pageCanvas.clientHeight);
        var x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
        var y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
        var x2 = endX / __ZOOMSCALE;
        var y2 = (pageHeight - endY) / __ZOOMSCALE;

        var dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);

        if (dynamicCanvas.childNodes.length > 0) {
            var svgObj = dynamicCanvas.firstChild.firstChild.firstChild;
            var box = _getCorrectedBoundingBox([x1, y1, x2, y2], dynamicCanvas, __ZOOMSCALE);
            svgObj.setAttribute("x", box.x1);
            svgObj.setAttribute("y", box.y1);
            svgObj.setAttribute("width", box.x2 - box.x1);
            svgObj.setAttribute("height", box.y2 - box.y1);
        } else {
            var annotation = {
                type: _markupTypes.rectangle,
                id: 0,
                vertices: [x1, y1, x1, y1],
                pageNo: _markupMode.mouse.pageNo - 1,
                filled: false,
                visible: true,
                isNew: false
            };
            var pageWidth = parseInt(pageCanvas.clientWidth);
             var svgHeader = "<svg height = " + pageHeight + "px width = " + pageWidth + "px style = 'position: absolute; left: 0px; top: 0px'>";
            _displayPdfRectangle(annotation, dynamicCanvas, false, __ZOOMSCALE);
            dynamicCanvas.innerHTML = svgHeader + dynamicCanvas.innerHTML + "</svg>";
        }
    }

    function _handleCreateEllipseEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        var boundingClientRect;
        e.preventDefault();
        if (e.type == "mousedown") {
            var selectedLength = _markupMode.selectedAnnotations.length;
            for (var i = 0; i < selectedLength; i++) {
                _setPdfAnnotationSelect(_markupMode.selectedAnnotations[0], false);
            }
            var pageNo = parseInt(e.target.id.substring(e.target.className.length));
            _createDynamicMarkupCanvas(pageNo, _handleCreateEllipseEvent);
            _markupMode.mouse.down = true;
            boundingClientRect = document.getElementById("PdfPageDisplayCanvas" + pageNo).getBoundingClientRect();
            _markupMode.mouse.xStart = e.clientX - boundingClientRect.left;
            _markupMode.mouse.yStart = e.clientY - boundingClientRect.top;
            _markupMode.mouse.pageNo = pageNo;
        } else if (e.type == "mouseup" && _markupMode.mouse.down) {
            e.stopPropagation();
            boundingClientRect = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).getBoundingClientRect();
            _markupMode.mouse.down = false;
            _markupMode.mouse.xEnd = e.clientX - boundingClientRect.left;
            _markupMode.mouse.yEnd = e.clientY - boundingClientRect.top;
            _createEllipseMarkup();
            document.getElementById("PdfPageDisplayWrapper" + _markupMode.mouse.pageNo).removeChild(document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo));
        } else if (e.type == "mousemove" && _markupMode.mouse.down) {
            e.stopPropagation();
            boundingClientRect = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).getBoundingClientRect();
            var x = e.clientX - boundingClientRect.left;
            var y = e.clientY - boundingClientRect.top;
            _drawDynamicEllipseMarkup(x, y);
        }
    }

    function _createEllipseMarkup () {
        var width = Math.abs(_markupMode.mouse.xEnd - _markupMode.mouse.xStart);
        var height = Math.abs(_markupMode.mouse.yEnd - _markupMode.mouse.yStart);
        if (width > 0 && height > 0) {
            var pageHeight = parseInt(document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).clientHeight);
            var x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
            var y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
            var x2 = _markupMode.mouse.xEnd / __ZOOMSCALE;
            var y2 = (pageHeight - _markupMode.mouse.yEnd) / __ZOOMSCALE;
            var filledVal = _markupMode.type.indexOf("Filled") > -1;
            var annotation = {
                type: filledVal ? _markupTypes.ellipseFilled : _markupTypes.ellipse,
                id: _getNextPdfAnnotationId(),
                vertices: [x1, y1, x2, y2],
                pageNo: _markupMode.mouse.pageNo - 1,
                filled: filledVal ? true : false,
                visible: true,
                isNew: true
            };
            var parsedAnnoSet = _pdfParsedAnnotationSet;
            if (!parsedAnnoSet) {
                parsedAnnoSet = [];
            }
            parsedAnnoSet.push(annotation);
            _displayPdfAnnotations(parsedAnnoSet);
            if (!_pageAnnoSetList[_markupMode.mouse.pageNo]) {
                _pageAnnoSetList[_markupMode.mouse.pageNo] = [];
            }
            _pageAnnoSetList[_markupMode.mouse.pageNo].push(_pdfParsedAnnotationSet.length-1);
            _pushActionToMarkupHistory(_undoPresets.create, annotation.id, annotation);
            _markupObserver.set("annoCreated", annotation);
            _markupObserver.set("annoSetEdited");
        }
        returnObj.SetMarkupModePDF(null, false, []);
    }

    function _drawDynamicEllipseMarkup (endX, endY) {
        var pageCanvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
        var pageHeight = parseInt(pageCanvas.clientHeight);
        var x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
        var y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
        var x2 = endX / __ZOOMSCALE;
        var y2 = (pageHeight - endY) / __ZOOMSCALE;

        var dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);

        if (dynamicCanvas.childNodes.length > 0) {
            var svgObj = dynamicCanvas.firstChild.firstChild.firstChild;
            var box = _getCorrectedBoundingBox([x1, y1, x2, y2], dynamicCanvas, __ZOOMSCALE);
            svgObj.setAttribute("cx", (_markupMode.mouse.xStart + endX)/2);
            svgObj.setAttribute("cy", (_markupMode.mouse.yStart + endY)/2);
            svgObj.setAttribute("rx", (box.x2 - box.x1)/2);
            svgObj.setAttribute("ry", (box.y2 - box.y1)/2);
        } else {
            var annotation = {
                type: _markupTypes.ellipse,
                id: 0,
                vertices: [x1, y1, x1, y1],
                pageNo: _markupMode.mouse.pageNo - 1,
                filled: false,
                visible: true,
                isNew: false
            };
            var pageWidth = parseInt(pageCanvas.clientWidth);
            var svgHeader = "<svg height = " + pageHeight + "px width = " + pageWidth + "px style = 'position: absolute; left: 0px; top: 0px'>";
            _displayPdfCircle(annotation, dynamicCanvas, false, __ZOOMSCALE);
            dynamicCanvas.innerHTML = svgHeader + dynamicCanvas.innerHTML + "</svg>";
        }
    }

    function _handleCreateLeaderLineEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        var boundingClientRect;
        e.preventDefault();
        if (e.type == "mousedown") {
            var selectedLength = _markupMode.selectedAnnotations.length;
            for (var i = 0; i < selectedLength; i++) {
                _setPdfAnnotationSelect(_markupMode.selectedAnnotations[0], false);
            }
            var pageNo = parseInt(e.target.id.substring(e.target.className.length));
            _createDynamicMarkupCanvas(pageNo, _handleCreateLeaderLineEvent);
            _markupMode.mouse.down = true;
            boundingClientRect = e.target.getBoundingClientRect();
            _markupMode.mouse.xStart = e.clientX - boundingClientRect.left;
            _markupMode.mouse.yStart = e.clientY - boundingClientRect.top;
            _markupMode.mouse.pageNo = pageNo;
        } else if (e.type == "mouseup" && _markupMode.mouse.down) {
            e.stopPropagation();
            boundingClientRect = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).getBoundingClientRect();
            _markupMode.mouse.down = false;
            _markupMode.mouse.xEnd = e.clientX - boundingClientRect.left;
            _markupMode.mouse.yEnd = e.clientY - boundingClientRect.top;
            _createLeaderLineMarkup();
            document.getElementById("PdfPageDisplayWrapper" + _markupMode.mouse.pageNo).removeChild(document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo));
        } else if (e.type == "mousemove" && _markupMode.mouse.down) {
            e.stopPropagation();
            boundingClientRect = e.target.parentNode.parentNode.getBoundingClientRect();
            var x = e.clientX - boundingClientRect.left;
            var y = e.clientY - boundingClientRect.top;
            _drawDynamicLeaderLineMarkup(x, y);
        }
    }

    function _createLeaderLineMarkup () {
        if (_markupMode.mouse.xStart != _markupMode.mouse.xEnd || _markupMode.mouse.yStart != _markupMode.mouse.yEnd) {
            var pageHeight = parseInt(document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).clientHeight);
            var x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
            var y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
            var x2 = _markupMode.mouse.xEnd / __ZOOMSCALE;
            var y2 = (pageHeight - _markupMode.mouse.yEnd) / __ZOOMSCALE;
            var boundingSpacing = 5.5;
            var bx1 = x1 < x2 ? x1 - boundingSpacing : x1 + boundingSpacing;
            var bx2 = x1 < x2 ? x2 + boundingSpacing : x2 - boundingSpacing;
            var by1 = y1 < y2 ? y1 - boundingSpacing : y1 + boundingSpacing;
            var by2 = y1 < y2 ? y2 + boundingSpacing : y2 - boundingSpacing;
            var headAndTail = _markupMode.type == _markupTypes.leaderLineHeadTail;
            var annotation = {
                type: _markupTypes.leaderLine,
                id: _getNextPdfAnnotationId(),
                boundingBox: [bx2, by2, bx1, by1],
                vertices: [x2, y2, x1, y1],
                pageNo: _markupMode.mouse.pageNo - 1,
                head: headAndTail ? "ClosedArrow" : "None",
                tail: headAndTail ? "Circle" : "None",
                visible: true,
                isNew: true
            };
            var parsedAnnoSet = _pdfParsedAnnotationSet;
            if (!parsedAnnoSet) {
                parsedAnnoSet = [];
            }
            parsedAnnoSet.push(annotation);
            _displayPdfAnnotations(parsedAnnoSet);
            if (!_pageAnnoSetList[_markupMode.mouse.pageNo]) {
                _pageAnnoSetList[_markupMode.mouse.pageNo] = [];
            }
            _pageAnnoSetList[_markupMode.mouse.pageNo].push(_pdfParsedAnnotationSet.length-1);
            _pushActionToMarkupHistory(_undoPresets.create, annotation.id, annotation);
            _markupObserver.set("annoCreated", annotation);
        }
        returnObj.SetMarkupModePDF(null, false, []);
        _markupObserver.set("annoSetEdited");
    }

    function _drawDynamicLeaderLineMarkup (endX, endY) {
        var pageCanvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
        var pageHeight = parseInt(pageCanvas.clientHeight);
        var dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);
        if (dynamicCanvas.childNodes.length > 0) {
            var svgObj = dynamicCanvas.firstChild.firstChild.firstChild;
            svgObj.setAttribute("x1", endX);
            svgObj.setAttribute("y1", endY);

        } else {
            var x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
            var y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
            var x2 = endX / __ZOOMSCALE;
            var y2 = (pageHeight - endY) / __ZOOMSCALE;
            var headAndTail = _markupMode.type == _markupTypes.leaderLineHeadTail;
            var annotation = {
                type: _markupTypes.leaderLine,
                id: 0,
                boundingBox: [0, 0, 0, 0],
                vertices: [x1, y1, x1, y1],
                pageNo: _markupMode.mouse.pageNo - 1,
                head: headAndTail ? "ClosedArrow" : "None",
                tail: headAndTail ? "Circle" : "None",
                visible: true,
                isNew: true
            };
            var pageWidth = parseInt(pageCanvas.clientWidth);
            var svgHeader = "<svg height = " + pageHeight + "px width = " + pageWidth + "px style = 'position: absolute; left: 0px; top: 0px'>";
            _displayPdfLeaderLine(annotation, dynamicCanvas, false, __ZOOMSCALE);
            dynamicCanvas.innerHTML = svgHeader + dynamicCanvas.innerHTML + "</svg>";
        }
    }

    function _handleCreateFreehandEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        var boundingClientRect;
        e.preventDefault();
        if (e.type == "mousedown") {
            var selectedLength = _markupMode.selectedAnnotations.length;
            for (var i = 0; i < selectedLength; i++) {
                _setPdfAnnotationSelect(_markupMode.selectedAnnotations[0], false);
            }
            var pageNo = parseInt(e.target.id.substring(e.target.className.length));
            _createDynamicMarkupCanvas(pageNo, _handleCreateFreehandEvent);
            _markupMode.mouse.down = true;
            boundingClientRect = document.getElementById("PdfPageDisplayCanvas" + pageNo).getBoundingClientRect();
            _markupMode.mouse.xVect = [e.clientX - boundingClientRect.left];
            _markupMode.mouse.yVect = [e.clientY - boundingClientRect.top];
            _markupMode.mouse.pageNo = pageNo;
        } else if (e.type == "mouseup" && _markupMode.mouse.down) {
            e.stopPropagation();
            boundingClientRect = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).getBoundingClientRect();
            _markupMode.mouse.down = false;
            _markupMode.mouse.xVect.push(e.clientX - boundingClientRect.left);
            _markupMode.mouse.yVect.push(e.clientY - boundingClientRect.top);
            _createFreehandMarkup();
            document.getElementById("PdfPageDisplayWrapper" + _markupMode.mouse.pageNo).removeChild(document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo));
        } else if (e.type == "mousemove" && _markupMode.mouse.down) {
            e.stopPropagation();
            boundingClientRect = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).getBoundingClientRect();
            var x = e.clientX - boundingClientRect.left;
            var y = e.clientY - boundingClientRect.top;
            _markupMode.mouse.xVect.push(x);
            _markupMode.mouse.yVect.push(y);
            _drawDynamicFreehandMarkup(x, y);
        }
    }

    function _createFreehandMarkup () {
        if (_markupMode.mouse.xVect.length >= 2 && _markupMode.mouse.xVect.length == _markupMode.mouse.yVect.length) {
            var pageHeight = parseInt(document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).clientHeight);
            var minX, maxX, minY, maxY;
            minX = maxX = _markupMode.mouse.xVect[0] / __ZOOMSCALE;
            minY = maxY = (pageHeight - _markupMode.mouse.yVect[0]) / __ZOOMSCALE;
            var verticesArray = [minX, minY];

            for (var i = 1; i < _markupMode.mouse.xVect.length; i++) {
                var x = _markupMode.mouse.xVect[i] / __ZOOMSCALE;
                var y = (pageHeight - _markupMode.mouse.yVect[i]) / __ZOOMSCALE;
                if (minX > x) {
                    minX = x;
                } else if (maxX < x) {
                    maxX = x;
                }
                if (minY > y) {
                    minY = y;
                } else if (maxY < y) {
                    maxY = y;
                }
                verticesArray.push(x);
                verticesArray.push(y);
            }

            var boundingBoxArray = [minX, minY, maxX, maxY];
            var annotation = {
                type: _markupTypes.freehand,
                id: _getNextPdfAnnotationId(),
                vertices: verticesArray,
                boundingBox: boundingBoxArray,
                pageNo: _markupMode.mouse.pageNo - 1,
                visible: true,
                isNew: true
            };
            var parsedAnnoSet = _pdfParsedAnnotationSet;
            if (!parsedAnnoSet) {
                parsedAnnoSet = [];
            }
            parsedAnnoSet.push(annotation);
            _displayPdfAnnotations(parsedAnnoSet);
            if (!_pageAnnoSetList[_markupMode.mouse.pageNo]) {
                _pageAnnoSetList[_markupMode.mouse.pageNo] = [];
            }
            _pageAnnoSetList[_markupMode.mouse.pageNo].push(_pdfParsedAnnotationSet.length-1);
            _pushActionToMarkupHistory(_undoPresets.create, annotation.id, annotation);
            _markupObserver.set("annoCreated", annotation);
        }
        returnObj.SetMarkupModePDF(null, false, []);
        _markupObserver.set("annoSetEdited");
    }

    function _drawDynamicFreehandMarkup (endX, endY) {
        var pageCanvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
        var pageHeight = parseInt(pageCanvas.clientHeight);
        var dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);
        if (dynamicCanvas.childNodes.length > 0) {
            var svgObj = dynamicCanvas.firstChild.firstChild.firstChild;
            svgObj.setAttribute("d", svgObj.attributes.d.nodeValue + " L" + endX + " " + endY);

        } else {
            var x1 = _markupMode.mouse.xVect[0] / __ZOOMSCALE;
            var y1 = (pageHeight - _markupMode.mouse.yVect[0]) / __ZOOMSCALE;
            var annotation = {
                type: _markupTypes.freehand,
                id: 0,
                vertices: [x1, y1],
                boundingBox: [0, 0, 0, 0],
                pageNo: _markupMode.mouse.pageNo - 1,
                visible: true,
                isNew: true
            };
            var pageWidth = parseInt(pageCanvas.clientWidth);
            var svgHeader = "<svg height = " + pageHeight + "px width = " + pageWidth + "px style = 'position: absolute; left: 0px; top: 0px'>";
            _displayPdfFreehand(annotation, dynamicCanvas, false, __ZOOMSCALE);
            dynamicCanvas.innerHTML = svgHeader + dynamicCanvas.innerHTML + "</svg>";
        }
    }

    function _handleCreateNoteEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if (e.type == "mousedown") {
            e.preventDefault();
            var selectedLength = _markupMode.selectedAnnotations.length;
            for (var i = 0; i < selectedLength; i++) {
                _setPdfAnnotationSelect(_markupMode.selectedAnnotations[0], false);
            }
            var pageNo = parseInt(e.target.id.substring(e.target.className.length));
            var boundingClientRect = document.getElementById("PdfPageDisplayCanvas" + pageNo).getBoundingClientRect();
            _markupMode.mouse.xEnd = e.clientX - boundingClientRect.left;
            _markupMode.mouse.yEnd = e.clientY - boundingClientRect.top;
            _markupMode.mouse.pageNo = pageNo;
            _createDynamicNoteCanvas(pageNo);
            _createUserInputForNoteMarkup(pageNo, _markupMode.mouse.xEnd, _markupMode.mouse.yEnd);
        }
    }

    function _createDynamicNoteCanvas (pageNo) {
        var pageWrapper = document.getElementById("PdfPageDisplayWrapper" + pageNo);
        var dynamicCanvas = document.createElement("div");
        dynamicCanvas.id = "PdfPageDynamicMarkupCanvas" + pageNo;
        dynamicCanvas.className = "PdfPageDynamicMarkupCanvas";
        dynamicCanvas.height = pageWrapper.height;
        dynamicCanvas.width = pageWrapper.width;
        dynamicCanvas.setAttribute('style', "height: " + pageWrapper.height + "; width: " + pageWrapper.width + "; display: inline-block; position: absolute; z-index: 4");
        pageWrapper.insertBefore(dynamicCanvas, pageWrapper.firstChild);
    }

    function _createUserInputForNoteMarkup (pageNo, clickX, clickY) {
        var dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + pageNo);
        var pageCanvas = document.getElementById("PdfPageDisplayCanvas" + pageNo);
        var pageHeight = parseInt(pageCanvas.clientHeight);
        var pageWidth = parseInt(pageCanvas.clientWidth);
        var x1 = clickX / __ZOOMSCALE;
        var y1 = (pageHeight - clickY) / __ZOOMSCALE;

        var editableDiv = document.createElement("div");
        editableDiv.id = "PdfMarkupNoteCreator";
        editableDiv.className = "PdfMarkupNoteCreator";
        var style = "display:inline-block; position: absolute; left:" + clickX + "px; top:" + clickY + "px; min-height:" + _noteDefaults.fontSize * __ZOOMSCALE + "px; min-width:" + _noteDefaults.fontSize * _noteDefaults.minWidth * __ZOOMSCALE + "px; max-width:" + _noteDefaults.fontSize * _noteDefaults.minWidth * __ZOOMSCALE + "px;";
        style += " font-family:" + _noteDefaults.fontFamily + "; color:" + _noteDefaults.fontColor + "; font-size:" + (_noteDefaults.fontSize * __ZOOMSCALE) + "px; text-align:" + _noteDefaults.textAlignment + "; background-color:" + _uiColors.markup.white + ";";
        style += " border:" + 2 * __ZOOMSCALE + "px solid " + _uiColors.markup.line + "; padding:" + (2 * __ZOOMSCALE) + "px; white-space: pre-wrap";
        editableDiv.setAttribute("style", style);
        var editableP = document.createElement("p");
        editableP.id = "PdfMarkupNoteCreatorP";
        editableP.className = "PdfMarkupNoteCreator";
        editableP.setAttribute("contentEditable", "true");
        editableP.setAttribute("style", "min-height: " + _noteDefaults.fontSize * __ZOOMSCALE + "px; min-width:" + _noteDefaults.fontSize * _noteDefaults.minWidth * __ZOOMSCALE + "px; word-wrap: break-word; margin: 0px;");
        editableP.innerHTML = "";
        editableDiv.appendChild(editableP);

        dynamicCanvas.appendChild(editableDiv);

        dynamicCanvas.addEventListener("mousedown", _checkExitNoteCreation);

        editableP.focus();
    }

    function _checkExitNoteCreation (e) {
        if (e.target.id != "PdfMarkupNoteCreator" && e.target.id != "PdfMarkupNoteCreatorP") {
            returnObj.SetMarkupModePDF(null, false, []);
        }
    }

    function _createNoteMarkup () {
        var divNote = document.getElementById("PdfMarkupNoteCreator");

        var pageCanvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
        var pageHeight = parseInt(pageCanvas.clientHeight);

        var bx1, by1, bx2, by2;
        var boundingArray = [];
        var leaderLineArray = [];
        var boxDiffsArray = [];

        if (_markupMode.type == _markupTypes.note) {
            bx1 = _markupMode.mouse.xEnd / __ZOOMSCALE;
            by1 = ((pageHeight - _markupMode.mouse.yEnd) / __ZOOMSCALE);
            bx2 = (_markupMode.mouse.xEnd + parseFloat(divNote.clientWidth)) / __ZOOMSCALE + 10;
            by2 = ((pageHeight - (_markupMode.mouse.yEnd + parseFloat(divNote.clientHeight))) / __ZOOMSCALE) - 6;
            boundingArray = [bx1, by1, bx2, by2];
        } else if (_markupMode.type == _markupTypes.noteLeader) {

            if (_markupMode.mouse.xStart < _markupMode.mouse.xEnd) {
                bx1 = _markupMode.mouse.xStart / __ZOOMSCALE;
                bx2 = ((_markupMode.mouse.xEnd + parseFloat(divNote.clientWidth)) / __ZOOMSCALE) + 10;
            } else {
                bx1 = ((_markupMode.mouse.xEnd - parseFloat(divNote.clientWidth)) / __ZOOMSCALE) + 10;
                bx2 = _markupMode.mouse.xStart / __ZOOMSCALE;
            }
            by1 = (pageHeight - parseFloat(divNote.style.top)) / __ZOOMSCALE;
            by2 = (pageHeight - (parseFloat(divNote.style.top) + parseFloat(divNote.clientHeight) + (6 * __ZOOMSCALE))) / __ZOOMSCALE;

            var x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
            var y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
            var x2 = _markupMode.mouse.xEnd / __ZOOMSCALE;
            var y2 = (pageHeight - _markupMode.mouse.yEnd) / __ZOOMSCALE;
            var theta = Math.abs(Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI));
            var x3, y3, bx3, by3, dx1, dy1, dx2, dy2;
            if (theta > 67.5 && theta < 112.5) {
                var tailDiff = y2 > y1 ? 12 : -12;
                x3 = x2;
                y3 = y2 + tailDiff;
                bx1 = parseFloat(divNote.style.left) / __ZOOMSCALE;
                bx3 = (parseFloat(divNote.style.left) + parseFloat(divNote.clientWidth)) / __ZOOMSCALE;
                if (y1 > by1) {
                    by1 = y1
                }
                if (y3 > y2) {
                    by3 = y3 + (parseFloat(divNote.clientHeight) / __ZOOMSCALE);
                } else {
                    by3 = by2;
                }
                boundingArray = [bx1, by1, bx3, by3];
            } else {
                var tailDiff = x2 > x1 ? 12 : -12;
                x3 = x2 + tailDiff;
                y3 = y2;
                bx3 = x2 > x1 ? x2 + ((parseFloat(divNote.clientWidth) + 2) / __ZOOMSCALE) : x2 - ((parseFloat(divNote.clientWidth) + 2) / __ZOOMSCALE);
                by3 = Math.min(by2, y1, y2);
                bx1 = Math.min(x1, parseFloat(divNote.style.left) / __ZOOMSCALE);
                by1 = Math.max((pageHeight - parseFloat(divNote.style.top)) / __ZOOMSCALE, y1);
                boundingArray = [bx1, by1, bx3, by3];
            }
            leaderLineArray = [x1, y1, x2, y2, x3, y3];

            dx1 = Math.abs(bx1 - (parseFloat(divNote.style.left) / __ZOOMSCALE));
            dy1 = Math.abs(by3 - ((pageHeight - (parseFloat(divNote.style.top) + parseFloat(divNote.clientHeight))) / __ZOOMSCALE)) - 6;
            dx2 = Math.abs(bx3 - ((parseFloat(divNote.style.left) + parseFloat(divNote.clientWidth)) / __ZOOMSCALE)) - 10;
            dy2 = Math.abs(by1 - ((pageHeight - parseFloat(divNote.style.top)) / __ZOOMSCALE));

            boxDiffsArray = [dx1, dy1, dx2, dy2];
        }


        var extractedNodes = divNote.firstChild.childNodes;
        var extractedContent;
        if (extractedNodes.length > 0) {
            extractedContent = encodeContent(extractedNodes[0].textContent);
            for (var i = 1; i < extractedNodes.length; i++) {
                extractedContent += "\n" + encodeContent(extractedNodes[i].textContent);
            }
            extractedContent = extractedContent.replace(/\s+$/, "");
        } else {
            extractedContent = "";
        }

        var annotation = {
            type: _markupMode.type,
            id: _getNextPdfAnnotationId(),
            boundingBox: boundingArray,
            pageNo: _markupMode.mouse.pageNo -1,
            content: extractedContent,
            fontFamily: _noteDefaults.fontFamily,
            textAlignment: _noteDefaults.textAlignment,
            fontColor: _noteDefaults.fontColor,
            fontSize: _noteDefaults.fontSize,
            head: _markupMode.type == _markupTypes.note ? "None" : "ClosedArrow",
            leaderLineVertices: leaderLineArray,
            visible: true,
            boxDiffs: boxDiffsArray,
            isNew: true
        };
        var parsedAnnoSet = _pdfParsedAnnotationSet;
        if (!parsedAnnoSet) {
            parsedAnnoSet = [];
        }
        parsedAnnoSet.push(annotation);
        _displayPdfAnnotations(parsedAnnoSet);
        if (!_pageAnnoSetList[_markupMode.mouse.pageNo]) {
            _pageAnnoSetList[_markupMode.mouse.pageNo] = [];
        }
        _pageAnnoSetList[_markupMode.mouse.pageNo].push(_pdfParsedAnnotationSet.length-1);
        _pushActionToMarkupHistory(_undoPresets.create, annotation.id, annotation);
        _markupObserver.set("annoCreated", annotation);
        document.getElementById("PdfPageDisplayWrapper" + _markupMode.mouse.pageNo).removeChild(document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo));
        _markupObserver.set("annoSetEdited");
    }

    function _handleCreateNoteLeaderEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        var boundingClientRect;
        e.preventDefault();
        if (e.type == "mousedown") {
            var selectedLength = _markupMode.selectedAnnotations.length;
            for (var i = 0; i < selectedLength; i++) {
                _setPdfAnnotationSelect(_markupMode.selectedAnnotations[0], false);
            }
            var pageNo = parseInt(e.target.id.substring(e.target.className.length));
            _createDynamicMarkupCanvas(pageNo, _handleCreateNoteLeaderEvent);
            _markupMode.mouse.down = true;
            boundingClientRect = e.target.getBoundingClientRect();
            _markupMode.mouse.xStart = e.clientX - boundingClientRect.left;
            _markupMode.mouse.yStart = e.clientY - boundingClientRect.top;
            _markupMode.mouse.pageNo = pageNo;
        } else if (e.type == "mouseup" && _markupMode.mouse.down) {
            e.stopPropagation();
            boundingClientRect = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).getBoundingClientRect();
            _markupMode.mouse.down = false;
            _markupMode.mouse.xEnd = e.clientX - boundingClientRect.left;
            _markupMode.mouse.yEnd = e.clientY - boundingClientRect.top;
            _createUserInputForNoteLeaderMarkup();
        } else if (e.type == "mousemove" && _markupMode.mouse.down) {
            e.stopPropagation();
            boundingClientRect = e.target.parentNode.parentNode.getBoundingClientRect();
            var x = e.clientX - boundingClientRect.left;
            var y = e.clientY - boundingClientRect.top;
            _drawDynamicNoteLeaderMarkup(x, y);
        }
    }

    function _drawDynamicNoteLeaderMarkup (endX, endY) {
        var pageCanvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
        var pageHeight = parseInt(pageCanvas.clientHeight);
        var dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);
        if (dynamicCanvas.childNodes.length > 0) {
            var svgObj = dynamicCanvas.firstChild.childNodes[1].firstChild;
            var dx = endX - svgObj.points.getItem(0).x;
            var dy = endY - svgObj.points.getItem(0).y;
            var theta = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
            if (theta > 67.5 && theta < 112.5) {
                var tailDiff = endY > svgObj.points.getItem(0).y ? 12 * __ZOOMSCALE : -12 * __ZOOMSCALE;
                svgObj.points.getItem(1).x = endX;
                svgObj.points.getItem(1).y = endY;
                svgObj.points.getItem(2).x = endX;
                svgObj.points.getItem(2).y = endY + tailDiff;
            } else {
                var tailDiff = endX > svgObj.points.getItem(0).x ? 12 * __ZOOMSCALE : -12 * __ZOOMSCALE;
                svgObj.points.getItem(1).x = endX;
                svgObj.points.getItem(1).y = endY;
                svgObj.points.getItem(2).x = endX + tailDiff;
                svgObj.points.getItem(2).y = endY;
            }
        } else {
            var x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
            var y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
            var x2 = endX / __ZOOMSCALE;
            var y2 = (pageHeight - endY) / __ZOOMSCALE;
            var headAndTail = _markupMode.type == _markupTypes.leaderLineHeadTail;
            var annotation = {
                type: _markupTypes.polyline,
                id: 0,
                boundingBox: [0, 0, 0, 0],
                vertices: [x1, y1, x1, y1, (x1 + (12 * __ZOOMSCALE)), y1],
                pageNo: _markupMode.mouse.pageNo - 1,
                head: "ClosedArrow",
                tail: "None",
                visible: true,
                isNew: true
            };
            var pageWidth = parseInt(pageCanvas.clientWidth);
            var svgHeader = "<svg height = " + pageHeight + "px width = " + pageWidth + "px style = 'position: absolute; left: 0px; top: 0px'>";
            _displayPdfPolyLine(annotation, dynamicCanvas, false, __ZOOMSCALE);
            dynamicCanvas.innerHTML = svgHeader + _svgDefs + dynamicCanvas.innerHTML + "</svg>";
        }
    }

    function _createUserInputForNoteLeaderMarkup () {
        var x1 = _markupMode.mouse.xStart;
        var y1 = _markupMode.mouse.yStart;
        var x2 = _markupMode.mouse.xEnd;
        var y2 = _markupMode.mouse.yEnd;

        var theta = Math.abs(Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI));
        if (theta > 67.5 && theta < 112.5) {
            var tailDiff = y2 > y1 ? 12 * __ZOOMSCALE : -12 * __ZOOMSCALE;
            if (tailDiff > 0) {
                _createUserInputForNoteMarkup (_markupMode.mouse.pageNo, x2 - ((_noteDefaults.fontSize * _noteDefaults.minWidth * __ZOOMSCALE) / 2), y2 + tailDiff);
            } else {
                _createUserInputForNoteMarkup (_markupMode.mouse.pageNo, x2 - ((_noteDefaults.fontSize * _noteDefaults.minWidth * __ZOOMSCALE) / 2), y2 + tailDiff - ((_noteDefaults.fontSize) * __ZOOMSCALE));
            }
        } else {
            var tailDiff = x2 > x1 ? 12 * __ZOOMSCALE : -12 * __ZOOMSCALE;
            if (tailDiff > 0) {
                _createUserInputForNoteMarkup (_markupMode.mouse.pageNo, x2 + tailDiff, y2 - ((_noteDefaults.fontSize / 2) * __ZOOMSCALE));
            } else {
                _createUserInputForNoteMarkup (_markupMode.mouse.pageNo, x2 + tailDiff - (_noteDefaults.fontSize * _noteDefaults.minWidth * __ZOOMSCALE), y2 - ((_noteDefaults.fontSize / 2) * __ZOOMSCALE));
            }
        }
    }

    function _handleCreateTextEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        var boundingClientRect;
        if (e.type == "mousedown") {
            _clearPdfAnnoSelection();
            if (e.target.className == "PdfPageDynamicTextLayer") {
                _markupMode.mouse.down = true;
                boundingClientRect = e.target.parentNode.getBoundingClientRect();
                var pageNo = parseInt(e.target.parentNode.id.substring(e.target.parentNode.className.length));
                _markupMode.mouse.pageNo = pageNo;
            }
        } else if (e.type == "mouseup" && _markupMode.mouse.down) {
            e.stopPropagation();
            _markupMode.mouse.down = false;
            boundingClientRect = document.getElementById("PdfPageDynamicTextMarkupCanvas" + _markupMode.mouse.pageNo).getBoundingClientRect();

            var selection = window.getSelection();
            var parentNode = selection.anchorNode.parentNode.parentNode;
            var anchorParentBox = selection.anchorNode.parentNode.getBoundingClientRect();
            var focusParentBox = selection.focusNode.parentNode.getBoundingClientRect();
            _createTextMarkup(selection, _markupMode.type);
        }
    }

    function _createTextMarkup (selection, markupType) {
        if (selection.anchorNode && selection.focusNode && !selection.isCollapsed) {
                var textHolder = document.getElementById("PdfPageDynamicTextMarkupCanvas" + _markupMode.mouse.pageNo);
                var pageHeight = parseFloat(textHolder.parentNode.clientHeight);
                var select = false;
                var verticesArray = [];

                //node IDs contain the id number - id of the format: "PdfPageDynamicTextLayer*PAGENO*_*IDNO*"
                var anchorId = parseInt(selection.anchorNode.parentNode.id.substring(selection.anchorNode.parentNode.id.indexOf("_") + 1));
                var focusId = parseInt(selection.focusNode.parentNode.id.substring(selection.focusNode.parentNode.id.indexOf("_") + 1));
                var anchorNode, focusNode, anchorOffset, focusOffset;
                if (anchorId <= focusId) {
                    anchorNode = document.getElementById("PdfPageDynamicTextLayer" + _markupMode.mouse.pageNo + "_" + anchorId);
                    focusNode = document.getElementById("PdfPageDynamicTextLayer" + _markupMode.mouse.pageNo + "_" + focusId);
                    if (selection.anchorOffset <= selection.focusOffset) {
                        anchorOffset = selection.anchorOffset;
                        focusOffset = selection.focusOffset;
                    } else {
                        anchorOffset = selection.focusOffset;
                        focusOffset = selection.anchorOffset;
                    }
                } else {
                    anchorNode = document.getElementById("PdfPageDynamicTextLayer" + _markupMode.mouse.pageNo + "_" + focusId);
                    focusNode = document.getElementById("PdfPageDynamicTextLayer" + _markupMode.mouse.pageNo + "_" + anchorId);
                    anchorOffset = selection.focusOffset;
                    focusOffset = selection.anchorOffset;
                }

                var margin = 2 * __ZOOMSCALE;

                for (var i = 0; i < textHolder.childNodes.length; i++) {
                    var textNode = textHolder.childNodes[i];
                    var x1, y1, x2, y2, x3, y3, x4, y4;
                    if (select) {
                        if (textNode != focusNode) {
                            x1 = x4 = (parseFloat(textNode.style.left) - margin) / __ZOOMSCALE;
                            y1 = y2 = (pageHeight - parseFloat(textNode.style.top)) / __ZOOMSCALE;
                            x2 = x3 = (parseFloat(textNode.style.left) + parseFloat(textNode.clientWidth) + margin) / __ZOOMSCALE;
                            y3 = y4 = (pageHeight - (parseFloat(textNode.style.top) + parseFloat(textNode.clientHeight) + margin)) / __ZOOMSCALE;

                            if (textNode.style.transform && textNode.style.transform.indexOf("rotate(") != -1) {
                                var alphaDegrees = parseInt(textNode.style.transform.substr(textNode.style.transform.indexOf("rotate(") + 7));
                                if (alphaDegrees) {
                                    var alpha = alphaDegrees * Math.PI / 180;
                                    var sign = alpha >= 0 ? 1 : -1;
                                    if (anchorOffset > 0) {
                                        var tempX1 = x1;
                                        x1 = (parseFloat(textNode.style.left) - margin) / __ZOOMSCALE;
                                        var x1Diff = sign * (tempX1 - x1);
                                        x1 = x1 - (x1Diff * Math.cos(alpha));
                                        y1 = y1 + (x1Diff * Math.sin(alpha));

                                        var tempX4 = x4;
                                        x4 = (parseFloat(textNode.style.left) - margin) / __ZOOMSCALE;
                                        var x4Diff = sign * (tempX4 - x4);
                                        x4 = x4 - (x4Diff * Math.cos(alpha));
                                        y4 = y4 + (x4Diff * Math.sin(alpha));

                                    }
                                    var dx2 = x2 - x1;
                                    var dy2 = y2 - y1;
                                    var dx3 = x3 - x2;
                                    var dy3 = y3 - y2;
                                    var dx4 = x4 - x3;
                                    var dy4 = y4 - y3;

                                    var d2 = sign * Math.sqrt((dx2 * dx2) + (dy2 * dy2));
                                    x2 = x1 - (d2 * Math.cos(alpha));
                                    y2 = y1 + (d2 * Math.sin(alpha));

                                    var d3 = Math.sqrt((dx3 * dx3) + (dy3 * dy3));
                                    x3 = x2 - (d3 * Math.cos((270 * Math.PI / 180) + alpha));
                                    y3 = y2 + (d3 * Math.sin((270 * Math.PI / 180) + alpha));

                                    var d4 = Math.sqrt((dx4 * dx4) + (dy4 * dy4));
                                    x4 = x3 + (d4 * Math.cos(Math.PI + alpha));
                                    y4 = y3 - (d4 * Math.sin(Math.PI + alpha));
                                }
                            }

                            verticesArray.push(x1);
                            verticesArray.push(y1);

                            verticesArray.push(x2);
                            verticesArray.push(y2);

                            verticesArray.push(x4);
                            verticesArray.push(y4);

                            verticesArray.push(x3);
                            verticesArray.push(y3);

                        } else {
                            x1 = x4 = (parseFloat(textNode.style.left) - margin) / __ZOOMSCALE;
                            if (focusOffset > 0) {
                                var focusCharLength = 0;
                                for (var j = 0; j < focusNode.childNodes.length; j++) {
                                    focusCharLength += focusNode.childNodes[j].length;
                                }
                                if (focusOffset < focusCharLength) {
                                    var clonedFocusNode = textNode.cloneNode(true);
                                    clonedFocusNode.style.visibility = "hidden";
                                    textNode.parentNode.appendChild(clonedFocusNode);
                                    var focusText = clonedFocusNode.textContent.substring(0, focusOffset);
                                    clonedFocusNode.textContent = focusText;
                                    var rangeWidth = parseFloat(clonedFocusNode.clientWidth);
                                    x2 = x3 = x1 + ((rangeWidth + margin) / __ZOOMSCALE);
                                } else {
                                   x2 = x3 = ((parseFloat(textNode.style.left) + parseFloat(textNode.clientWidth)) + margin) / __ZOOMSCALE;
                                }
                            } else {
                                x2 = x3 = ((parseFloat(textNode.style.left) + parseFloat(textNode.clientWidth)) + margin) / __ZOOMSCALE;
                            }

                            y1 = y2 = (pageHeight - parseFloat(textNode.style.top)) / __ZOOMSCALE;
                            y3 = y4 = (pageHeight - (parseFloat(textNode.style.top) + parseFloat(textNode.clientHeight) + margin)) / __ZOOMSCALE;

                            if (textNode.style.transform && textNode.style.transform.indexOf("rotate(") != -1) {
                                var alphaDegrees = parseInt(textNode.style.transform.substr(textNode.style.transform.indexOf("rotate(") + 7));
                                if (alphaDegrees) {
                                    var alpha = alphaDegrees * Math.PI / 180;
                                    var sign = alpha >= 0 ? 1 : -1;
                                    if (anchorOffset > 0) {
                                        var tempX1 = x1;
                                        x1 = (parseFloat(textNode.style.left) - margin) / __ZOOMSCALE;
                                        var x1Diff = sign * (tempX1 - x1);
                                        x1 = x1 - (x1Diff * Math.cos(alpha));
                                        y1 = y1 + (x1Diff * Math.sin(alpha));

                                        var tempX4 = x4;
                                        x4 = (parseFloat(textNode.style.left) - margin) / __ZOOMSCALE;
                                        var x4Diff = sign * (tempX4 - x4);
                                        x4 = x4 - (x4Diff * Math.cos(alpha));
                                        y4 = y4 + (x4Diff * Math.sin(alpha));

                                    }
                                    var dx2 = x2 - x1;
                                    var dy2 = y2 - y1;
                                    var dx3 = x3 - x2;
                                    var dy3 = y3 - y2;
                                    var dx4 = x4 - x3;
                                    var dy4 = y4 - y3;

                                    var d2 = sign * Math.sqrt((dx2 * dx2) + (dy2 * dy2));
                                    x2 = x1 - (d2 * Math.cos(alpha));
                                    y2 = y1 + (d2 * Math.sin(alpha));

                                    var d3 = Math.sqrt((dx3 * dx3) + (dy3 * dy3));
                                    x3 = x2 - (d3 * Math.cos((270 * Math.PI / 180) + alpha));
                                    y3 = y2 + (d3 * Math.sin((270 * Math.PI / 180) + alpha));

                                    var d4 = Math.sqrt((dx4 * dx4) + (dy4 * dy4));
                                    x4 = x3 + (d4 * Math.cos(Math.PI + alpha));
                                    y4 = y3 - (d4 * Math.sin(Math.PI + alpha));
                                }
                            }

                            verticesArray.push(x1);
                            verticesArray.push(y1);

                            verticesArray.push(x2);
                            verticesArray.push(y2);

                            verticesArray.push(x4);
                            verticesArray.push(y4);

                            verticesArray.push(x3);
                            verticesArray.push(y3);

                            select = false;
                            break;
                        }
                    }
                    if (textNode == anchorNode) {
                        select = true;
                        if (anchorOffset == 0) {
                            x1 = x4 = (parseFloat(textNode.style.left) - margin) / __ZOOMSCALE;
                            if (textNode == focusNode && focusOffset > 0) {
                                var focusCharLength = 0;
                                for (var j = 0; j < focusNode.childNodes.length; j++) {
                                    focusCharLength += focusNode.childNodes[j].length;
                                }
                                if (focusOffset < focusCharLength) {
                                    var clonedFocusNode = textNode.cloneNode(true);
                                    clonedFocusNode.style.visibility = "hidden";
                                    textNode.parentNode.appendChild(clonedFocusNode);
                                    var focusText = clonedFocusNode.textContent.substring(0, focusOffset);
                                    clonedFocusNode.textContent = focusText;
                                    var rangeWidth = parseFloat(clonedFocusNode.clientWidth);
                                    x2 = x3 = x1 + ((rangeWidth + margin) / __ZOOMSCALE);
                                } else {
                                   x2 = x3 = ((parseFloat(textNode.style.left) + parseFloat(textNode.clientWidth)) + margin) / __ZOOMSCALE;
                                }
                            } else {
                                x2 = x3 = ((parseFloat(textNode.style.left) + parseFloat(textNode.clientWidth)) + margin) / __ZOOMSCALE;
                            }
                        } else {
                            var clonedAnchorNode = textNode.cloneNode(true);
                            clonedAnchorNode.style.visibility = "hidden";
                            textNode.parentNode.appendChild(clonedAnchorNode);
                            var anchorText = clonedAnchorNode.textContent.substring(0, anchorOffset);
                            clonedAnchorNode.textContent = anchorText;
                            x1 = x4 = ((parseFloat(textNode.style.left) + clonedAnchorNode.clientWidth) - margin) / __ZOOMSCALE;
                            if (textNode == focusNode && focusOffset > 0) {
                                var focusCharLength = 0;
                                for (var j = 0; j < focusNode.childNodes.length; j++) {
                                    focusCharLength += focusNode.childNodes[j].length;
                                }
                                if (focusOffset < focusCharLength) {
                                    var clonedFocusNode = textNode.cloneNode(true);
                                    clonedFocusNode.style.visibility = "hidden";
                                    textNode.parentNode.appendChild(clonedFocusNode);
                                    var focusText = clonedFocusNode.textContent.substring(anchorOffset, focusOffset);
                                    clonedFocusNode.textContent = focusText;
                                    var rangeWidth = parseFloat(clonedFocusNode.clientWidth);
                                    x2 = x3 = x1 + ((rangeWidth + margin) / __ZOOMSCALE);
                                } else {
                                   x2 = x3 = ((parseFloat(textNode.style.left) + parseFloat(textNode.clientWidth)) + margin) / __ZOOMSCALE;
                                }
                            } else {
                                x2 = x3 = ((parseFloat(textNode.style.left) + parseFloat(textNode.clientWidth)) + margin) / __ZOOMSCALE;
                            }
                        }
                        y1 = y2 = (pageHeight - parseFloat(textNode.style.top)) / __ZOOMSCALE;
                        y3 = y4 = (pageHeight - (parseFloat(textNode.style.top) + parseFloat(textNode.clientHeight) + margin)) / __ZOOMSCALE;

                        if (textNode.style.transform && textNode.style.transform.indexOf("rotate(") != -1) {
                            var alphaDegrees = parseInt(textNode.style.transform.substr(textNode.style.transform.indexOf("rotate(") + 7));
                            if (alphaDegrees) {
                                var alpha = alphaDegrees * Math.PI / 180;
                                var sign = alpha >= 0 ? 1 : -1;

                                if (anchorOffset > 0) {
                                    var tempX1 = x1;
                                    x1 = (parseFloat(textNode.style.left) - margin) / __ZOOMSCALE;
                                    var x1Diff = sign * (tempX1 - x1);
                                    x1 = x1 - (x1Diff * Math.cos(alpha));
                                    y1 = y1 + (x1Diff * Math.sin(alpha));

                                    var tempX4 = x4;
                                    x4 = (parseFloat(textNode.style.left) - margin) / __ZOOMSCALE;
                                    var x4Diff = sign * (tempX4 - x4);
                                    x4 = x4 - (x4Diff * Math.cos(alpha));
                                    y4 = y4 + (x4Diff * Math.sin(alpha));

                                }
                                var dx2 = x2 - x1;
                                var dy2 = y2 - y1;
                                var dx3 = x3 - x2;
                                var dy3 = y3 - y2;
                                var dx4 = x4 - x3;
                                var dy4 = y4 - y3;

                                var d2 = sign * Math.sqrt((dx2 * dx2) + (dy2 * dy2));
                                x2 = x1 - (d2 * Math.cos(alpha));
                                y2 = y1 + (d2 * Math.sin(alpha));

                                var d3 = Math.sqrt((dx3 * dx3) + (dy3 * dy3));
                                x3 = x2 - (d3 * Math.cos((270 * Math.PI / 180) + alpha));
                                y3 = y2 + (d3 * Math.sin((270 * Math.PI / 180) + alpha));

                                var d4 = Math.sqrt((dx4 * dx4) + (dy4 * dy4));
                                x4 = x3 + (d4 * Math.cos(Math.PI + alpha));
                                y4 = y3 - (d4 * Math.sin(Math.PI + alpha));
                            }
                        }

                        verticesArray = [x1, y1, x2, y2, x4, y4, x3, y3];
                        if (textNode == focusNode) {
                            select = false;
                            break;
                        }
                    }
                }

                if (verticesArray.length == 0) {
                    returnObj.SetMarkupModePDF(null, false, []);
                    return;
                }

                var bx1 = verticesArray[0];
                var by1 = verticesArray[1];
                var bx2 = verticesArray[0];
                var by2 = verticesArray[1];

                for (var j = 2; j < verticesArray.length-1; j+=2) {
                    bx1 = Math.min(bx1, verticesArray[j]);
                    by1 = Math.max(by1, verticesArray[j+1]);
                    bx2 = Math.max(bx2, verticesArray[j]);
                    by2 = Math.min(by2, verticesArray[j+1]);
                }

                var boundingArray = [bx1, by1, bx2, by2];

                var annotation = {
                    type: markupType,
                    id: _getNextPdfAnnotationId(),
                    vertices: verticesArray,
                    boundingBox: boundingArray,
                    pageNo: _markupMode.mouse.pageNo - 1,
                    visible: true,
                    isNew: false
                };

                var parsedAnnoSet = _pdfParsedAnnotationSet;
                if (!parsedAnnoSet) {
                    parsedAnnoSet = [];
                }
                parsedAnnoSet.push(annotation);
                _displayPdfAnnotations(parsedAnnoSet);
                selection.removeAllRanges();
                if (!_pageAnnoSetList[_markupMode.mouse.pageNo]) {
                    _pageAnnoSetList[_markupMode.mouse.pageNo] = [];
                }
                _pageAnnoSetList[_markupMode.mouse.pageNo].push(_pdfParsedAnnotationSet.length-1);
                _pushActionToMarkupHistory(_undoPresets.create, annotation.id, annotation);
                _markupObserver.set("annoCreated", annotation);
                _markupObserver.set("annoSetEdited");
        }
        returnObj.SetMarkupModePDF(null, false, []);
    }

//PDF MARKUP VISIBILITY

    function _handleSetPdfMarkupVisibility (idNo, visible) {
        var parsedAnno = _pdfParsedAnnotationSet[idNo];
        if (!parsedAnno) {
            return;
        }
        if (visible != parsedAnno.visible) {
            if (visible) {
                _pushActionToMarkupHistory(_undoPresets.unhide, idNo, parsedAnno);
            } else {
                _pushActionToMarkupHistory(_undoPresets.hide, idNo, parsedAnno);
            }
            parsedAnno.visible = visible;
            _redrawPdfAnnotationPage(parsedAnno.pageNo);
            _markupObserver.set("annoVisChanged", idNo, visible);
            var selectedIndex = _markupMode.hiddenSelectedAnnotations.indexOf(idNo)
            if (selectedIndex > -1) {
                _markupMode.hiddenSelectedAnnotations.splice(selectedIndex, 1);
                _handleSelectPdfAnnoAPI(idNo, true);
            }
            _markupObserver.set("annoSetEdited");
        }
    }

    function _redrawPdfAnnotationPage (pageNo) {
        _clearPdfAnnoSelection();
        var oldAnnoCanvas = document.getElementById("PdfAnnotationCanvas" + pageNo);
        if (oldAnnoCanvas) {
            oldAnnoCanvas.parentNode.removeChild(oldAnnoCanvas);
        }
        var stamps = [];
        for (var k = 0; k < _pageAnnoSetList[pageNo+1].length; k++) {
            var stamp = _displayPdfAnnotation(_pdfParsedAnnotationSet[_pageAnnoSetList[pageNo+1][k]]);
            if (stamp) {
                stamps.push(stamp);
            }
        }

        var newAnnoCanvas = document.getElementById("PdfAnnotationCanvas" + pageNo);
        if (!newAnnoCanvas) {
            return;
        }

        var defs = "<defs><marker id='ClosedArrow' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path d='M2,6 L9,1 L9,10 Z' style='fill:rgb(255,0,0);' /></marker><marker id='ClosedArrowNote' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path d='M2,6 L9,1 L9,10 Z' style='fill:rgb(255,255,255);stroke:rgb(255,0,0)' /></marker><marker id='OpenArrow' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path d='M9,1 L2,6 L9,10' style='fill:rgba(255,255,255,0);stroke:rgb(255,0,0)' /></marker><marker id='OpenArrowNote' markerWidth='11' markerHeight='11' refX='3' refY='6'orient='auto'><path d='M9,1 L2,6 L9,10' style='fill:rgba(255,255,255,0);stroke:rgb(255,0,0)' /></marker><marker id='Circle' markerWidth='9' markerHeight='9' refX='5' refY='5' orient='auto'><circle cx='5' cy='5' r='3' style='fill:rgb(255,0,0);' /></marker></defs>";
        var svgFooter = "</svg>";
        var svgHeader = "<svg id='PdfAnnotationSvgLayer" + pageNo + "' height = " + newAnnoCanvas.clientHeight + " width = " + newAnnoCanvas.clientWidth + " style = 'z-index: 2; position: absolute; left: 0px; top: 0px'>";
        var tempInnerHtml = newAnnoCanvas.innerHTML;
        newAnnoCanvas.innerHTML = svgHeader + defs + tempInnerHtml + svgFooter;

        for (var i = stamps.length-1; i >= 0; i--){
            var pushStamp = stamps[i];
            newAnnoCanvas.insertBefore(pushStamp.stampImage, newAnnoCanvas.firstChild);
        }
        _addMarkupSelectEventsByPage(pageNo);
    }

    function _addMarkupSelectEventsByPage (pageNo) {
        var selectableMUs = document.getElementsByClassName("PdfAnnotationElementSel");
        for(var i = 0; i < selectableMUs.length; i++) {
            if (_pdfParsedAnnotationSet[parseInt(selectableMUs[i].dataset.annoid)].pageNo == pageNo){
                _addMarkupSelectEvents(selectableMUs[i]);
            }
        }
    }

//PDF MARKUP UNDO REDO

    function _undoPdfMarkupAction () {
        if (!_markupHistory || !_markupHistory.stack || _markupHistory.stack.length == 0 || _markupHistory.index < 0 || _markupHistory.index >= _markupHistory.stack.length) {
            return;
        }
        var actionObject = _markupHistory.stack[_markupHistory.index];
        if (!actionObject || actionObject.idNo == null || (actionObject.actionName != "move" && actionObject.idNo < 0)) {
            return;
        }
        switch (actionObject.actionName) {
            case _undoPresets.create :
                var parsedAnno = _pdfParsedAnnotationSet[actionObject.idNo];
                if (_deletePdfAnnotationById(parsedAnno)) {
                    _pdfParsedAnnotationSet[actionObject.idNo] = null;
                    _pageAnnoSetList[actionObject.annotation.pageNo+1].splice(_pageAnnoSetList[actionObject.annotation.pageNo+1].indexOf(actionObject.idNo), 1);
                    _markupObserver.set("annoDeleted", actionObject.idNo);
                } else {
                    return;
                }
                break;
            case _undoPresets.delete :
                if (_pdfParsedAnnotationSet.length <= actionObject.idNo) {
                    return;
                };
                _pdfParsedAnnotationSet[actionObject.idNo] =  _deepFullCopyParsedAnnotation(actionObject.annotation);
                _pageAnnoSetList[actionObject.annotation.pageNo+1].push(actionObject.idNo);
                _redrawPdfAnnotationPage(actionObject.annotation.pageNo);
                _markupObserver.set("annoCreated", _pdfParsedAnnotationSet[actionObject.idNo]);
                break;
            case _undoPresets.hide:
                _pdfParsedAnnotationSet[actionObject.idNo].visible = true;
                _redrawPdfAnnotationPage(actionObject.annotation.pageNo);
                _markupObserver.set("annoVisChanged", actionObject.idNo, true);
                break;
            case _undoPresets.unhide:
                _pdfParsedAnnotationSet[actionObject.idNo].visible = false;
                _redrawPdfAnnotationPage(actionObject.annotation.pageNo);
                _markupObserver.set("annoVisChanged", actionObject.idNo, false);
                break;
            case _undoPresets.move:
                var newAnnotations = [];
                for (var i = 0; i < actionObject.idNo.length; i++) {
                    newAnnotations.push(_deepFullCopyParsedAnnotation(_pdfParsedAnnotationSet[actionObject.idNo[i]]));
                    _pdfParsedAnnotationSet[actionObject.idNo[i]] = _deepFullCopyParsedAnnotation(actionObject.annotation[i]);
                }
                actionObject.annotation = newAnnotations;
                _displayPdfAnnotations(_pdfParsedAnnotationSet);
                break;
            case _undoPresets.noteEdit:
            case _undoPresets.resize:
                var newAnnotation = _deepFullCopyParsedAnnotation(_pdfParsedAnnotationSet[actionObject.idNo]);
                _pdfParsedAnnotationSet[actionObject.idNo] = _deepFullCopyParsedAnnotation(actionObject.annotation);
                actionObject.annotation = newAnnotation;
                _redrawPdfAnnotationPage(actionObject.annotation.pageNo);
                break;
            default :
                break;
        }
        _markupObserver.set("annoSetEdited");
        _markupHistory.index -= 1;
    }

    function _redoPdfMarkupAction () {
        if (!_markupHistory || !_markupHistory.stack || _markupHistory.stack.length == 0 || _markupHistory.index < -1 || (_markupHistory.index >= _markupHistory.stack.length - 1)) {
            return;
        }
        _markupHistory.index += 1;
        var actionObject = _markupHistory.stack[_markupHistory.index];
        switch (actionObject.actionName) {
            case _undoPresets.create :
                if (_pdfParsedAnnotationSet.length <= actionObject.idNo) {
                    return;
                };
                _pdfParsedAnnotationSet[actionObject.idNo] = _deepFullCopyParsedAnnotation(actionObject.annotation);
                _pageAnnoSetList[actionObject.annotation.pageNo+1].push(actionObject.idNo);
                _redrawPdfAnnotationPage(actionObject.annotation.pageNo);
                _markupObserver.set("annoCreated", _pdfParsedAnnotationSet[actionObject.idNo]);
                break;
            case _undoPresets.delete:
                var parsedAnno = _pdfParsedAnnotationSet[actionObject.idNo];
                if (_deletePdfAnnotationById(parsedAnno)) {
                    _pdfParsedAnnotationSet[actionObject.idNo] = null;
                    _pageAnnoSetList[actionObject.annotation.pageNo+1].splice(_pageAnnoSetList[actionObject.annotation.pageNo+1].indexOf(actionObject.idNo), 1);
                    _markupObserver.set("annoDeleted", actionObject.idNo);
                } else {
                    return;
                }
                break;
            case _undoPresets.hide:
                _pdfParsedAnnotationSet[actionObject.idNo].visible = false;
                _redrawPdfAnnotationPage(actionObject.annotation.pageNo);
                _markupObserver.set("annoVisChanged", actionObject.idNo, false);
                break;
            case _undoPresets.unhide:
                _pdfParsedAnnotationSet[actionObject.idNo].visible = true;
                _redrawPdfAnnotationPage(actionObject.annotation.pageNo);
                _markupObserver.set("annoVisChanged", actionObject.idNo, true);
                break;
            case _undoPresets.move:
                var newAnnotations = [];
                for (var i = 0; i < actionObject.idNo.length; i++) {
                    newAnnotations.push(_deepFullCopyParsedAnnotation(_pdfParsedAnnotationSet[actionObject.idNo[i]]));
                    _pdfParsedAnnotationSet[actionObject.idNo[i]] = _deepFullCopyParsedAnnotation(actionObject.annotation[i]);
                }
                actionObject.annotation = newAnnotations;
                _displayPdfAnnotations(_pdfParsedAnnotationSet);
                break;
            case _undoPresets.noteEdit:
            case _undoPresets.resize:
                var newAnnotation = _deepFullCopyParsedAnnotation(_pdfParsedAnnotationSet[actionObject.idNo]);
                _pdfParsedAnnotationSet[actionObject.idNo] = _deepFullCopyParsedAnnotation(actionObject.annotation);
                actionObject.annotation = newAnnotation;
                _redrawPdfAnnotationPage(actionObject.annotation.pageNo);
                break;
            default :
                break;
        }
        _markupObserver.set("annoSetEdited");
    }

    /**
     * Push an action to the undo history list.
     * Clear the end of the list if we are situated anywhere but the end of it.
     * @param {string} actionName The name of the action to be added
     *      ("create", "delete", "move", ...)
     * @param {int / array} idNo id number of the anntoation affected or array of id numbers of the annotations affected
     * @param {JSON object / array} annotation The parsed annotation object of the annotation affected or an array of annotations affected
     * @private
     * @memberof ThingView
     **/
    function _pushActionToMarkupHistory (actionName, idNo, annotation) {
        var actionObject = {};
        actionObject.actionName = actionName;
        actionObject.idNo = idNo;
        if (typeof annotation == 'object' && !Array.isArray(annotation)) {
            actionObject.annotation = _deepFullCopyParsedAnnotation(annotation);
        } else if (typeof annotation == 'object' && Array.isArray(annotation)) {
            var annotations = [];
            for (var i = 0; i < annotation.length; i++) {
                annotations.push(_deepFullCopyParsedAnnotation(annotation[i]))
            }
            actionObject.annotation = annotations;
        }

        _markupHistory.index += 1;
        //remove back end of list
        if (_markupHistory.index > -1 && _markupHistory.index < _markupHistory.stack.length) {
            _markupHistory.stack.splice(_markupHistory.index);
        }
        _markupHistory.stack.push(actionObject);
        _markupObserver.set("annoUndoActionAdded", actionName, annotation.type);
    }

    function _deepFullCopyParsedAnnotation(oldAnno) {
        var copyAnno = {};
        copyAnno.id = oldAnno.id;
        copyAnno.type = oldAnno.type;
        copyAnno.visible = oldAnno.visible;
        copyAnno.isNew = oldAnno.isNew;
        copyAnno.pageNo = oldAnno.pageNo;
        switch (oldAnno.type) {
            case _markupTypes.leaderLine:
            case _markupTypes.leaderLineHeadTail:
            case _markupTypes.polyline:
            case _markupTypes.polyLineHeadTail:
                copyAnno.head = oldAnno.head;
                copyAnno.tail = oldAnno.tail;
            case _markupTypes.freehand:
            case _markupTypes.textHighlight:
            case _markupTypes.textStrikethrough:
            case _markupTypes.textUnderline:
                copyAnno.vertices = oldAnno.vertices.slice();
                copyAnno.boundingBox = oldAnno.boundingBox.slice();
                break;
            case _markupTypes.polygon:
            case _markupTypes.polygonFilled:
                copyAnno.boundingBox = oldAnno.boundingBox.slice();
            case _markupTypes.rectangle:
            case _markupTypes.rectangleFilled:
            case _markupTypes.ellipse:
            case _markupTypes.ellipseFilled:
                copyAnno.vertices = oldAnno.vertices.slice();
                copyAnno.filled = oldAnno.filled;
                break;
            case _markupTypes.note:
            case _markupTypes.noteLeader:
                copyAnno.boundingBox = oldAnno.boundingBox.slice();
                copyAnno.content = oldAnno.content;
                copyAnno.fontFamily = oldAnno.fontFamily;
                copyAnno.textAlignment = oldAnno.textAlignment;
                copyAnno.fontColor = oldAnno.fontColor;
                copyAnno.fontSize = oldAnno.fontSize;
                copyAnno.head = oldAnno.head;
                copyAnno.leaderLineVertices = oldAnno.leaderLineVertices.slice();
                break;
            case _markupTypes.stamp:
                copyAnno.vertices = oldAnno.vertices.slice();
                copyAnno.filter = oldAnno.filter;
                copyAnno.streamLength = oldAnno.streamLength;
                copyAnno.inflatedLength = oldAnno.inflatedLength;
                copyAnno.height = oldAnno.height;
                copyAnno.width = oldAnno.width;
                copyAnno.colorSpace = oldAnno.colorSpace;
                copyAnno.bitsPerComponent = oldAnno.bitsPerComponent;
                copyAnno.stream = oldAnno.stream;
                break;
            default:
                break;
        }
        return copyAnno;
    }

})();