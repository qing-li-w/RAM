/// <reference path="../../_all.ts" />

namespace ram {
    export class Page1Ctrl {
        public static $inject = [
            "$scope"
        ];

        constructor(
            private $scope: IRamScope
        ) {
        }
    }
}