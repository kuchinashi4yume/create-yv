#include "yv.h"
#include "yv_www.h"
#include "yv/yv_macos_menu.h"

#include <webview/webview.h>

#include <stdio.h>

void yv_run(void) {
    unsigned short port = 0;
    if (yv_www_start(NULL, &port) != 0) return;

    char url[64];
    int written = snprintf(url, sizeof(url), "http://127.0.0.1:%u/", port);
    if (written < 0 || (size_t)written >= sizeof(url)) {
        yv_www_stop();
        return;
    }

    webview_t webview = webview_create(0, 0);
    if (webview == NULL) {
        yv_www_stop();
        return;
    }

    webview_set_title(webview, "__YV_APP_NAME__");
    webview_set_size(webview, 800, 600, WEBVIEW_HINT_NONE);
    
    yv_macos_menu_setup();

    webview_error_t navigate_error = webview_navigate(webview, url);
    if (navigate_error != WEBVIEW_ERROR_OK) {
        fprintf(stderr, "yv: failed to navigate webview: %d\n", (int)navigate_error);
        webview_destroy(webview);
        yv_www_stop();
        return;
    }

    webview_error_t run_error = webview_run(webview);
    if (run_error != WEBVIEW_ERROR_OK) {
        fprintf(stderr, "yv: failed to run webview: %d\n", (int)run_error);
        webview_destroy(webview);
        yv_www_stop();
        return;
    }
    
    webview_destroy(webview);
    yv_www_stop();
}