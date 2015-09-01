/**
 * Created by wwadewitte on 6/8/15.
 */


$.ajax({
    type: 'POST',
    url: 'https://peakapi.whitespell.com/content/0',
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    data: JSON.stringify(object)
});