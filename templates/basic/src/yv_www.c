#include "yv_www.h"

#include <civetweb.h>

#include <CoreFoundation/CoreFoundation.h>

#include <limits.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>

static struct mg_context *yv_http_context = NULL;

static int yv_http_resolve_document_root(const char *document_root, char *resolved_root, size_t resolved_root_size) {
    if (resolved_root == NULL || resolved_root_size == 0) return -1;

    if (document_root != NULL) {
        if (realpath(document_root, resolved_root) == NULL) return -1;
    } else {
        CFBundleRef bundle = CFBundleGetMainBundle();
        if (bundle == NULL) return -1;

        CFURLRef resource_url = CFBundleCopyResourceURL(bundle, CFSTR("www"), NULL, NULL);
        if (resource_url == NULL) return -1;

        Boolean success = CFURLGetFileSystemRepresentation(resource_url, true, (UInt8 *)resolved_root, (CFIndex)resolved_root_size);
        
        CFRelease(resource_url);

        if (!success) return -1;
    }

    struct stat info;
    if (stat(resolved_root, &info) != 0) return -1;
    if (!S_ISDIR(info.st_mode)) return -1;
    
    return 0;
}


int yv_www_start(const char *document_root, unsigned short *port) {
    if (yv_http_context != NULL) return -1;

    char resolved_root[PATH_MAX];
    if (yv_http_resolve_document_root(document_root, resolved_root, sizeof(resolved_root)) != 0) {
        fprintf(stderr, "yv: unable to resolve document root\n");
        return -1;
    }

    // Check: https://github.com/civetweb/civetweb/blob/master/docs/api/mg_init_library.md
    if (mg_init_library(MG_FEATURES_FILES) == 0) {
        fprintf(stderr, "yv: failed to initialize CivetWeb\n");
        return -1;
    }

    const char *options[] = {
        "document_root",
        resolved_root,

        "listening_ports",
        "127.0.0.1:0",

        "enable_directory_listing",
        "no",

        NULL
    };

    yv_http_context = mg_start(NULL, NULL, options);
    if (yv_http_context == NULL) {
        fprintf(stderr, "yv: failed to start HTTP server\n");
        mg_exit_library();
        return -1;
    }

    struct mg_server_port server_port;
    int count = mg_get_server_ports(yv_http_context, 1, &server_port);
    if (count != 1 || server_port.port <= 0 || server_port.port > 65535) {
        fprintf(stderr, "yv: failed to determine HTTP server port\n");
        mg_stop(yv_http_context);
        yv_http_context = NULL;
        mg_exit_library();
        return -1;
    }

    if (port != NULL) {
        *port = (unsigned short)server_port.port;
    }

    return 0;
}


void yv_www_stop(void) {
    if (yv_http_context == NULL) return;
    mg_stop(yv_http_context);
    yv_http_context = NULL;
    mg_exit_library();
}