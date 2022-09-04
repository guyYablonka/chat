import http from 'http';
import https from 'https';
import url from 'url';
import _ from 'underscore';

import { settings } from '../../../settings';
import { FileUploadClass, FileUpload } from '../lib/FileUpload';
import '../../ufs/AmazonS3/server.js';

const options = {
	agent: new https.Agent({ rejectUnauthorized: false })
};

const get = function (file, req, res) {
	file = FileUpload.addExtensionTo(file);

	const forceDownload = typeof req.query.download !== 'undefined';

	this.store.getRedirectURL(file, forceDownload, (err, fileUrl) => {
		const validTypes = ['string', 'number'];
		if (err) {
			return console.error(err);
		}

		if (!fileUrl) {
			return res.end();
		}

		if (file.type && typeof file.type === 'string') {
			res.setHeader('Content-Type', file.type);
		}

		if (file.size && validTypes.includes(typeof file.size)) {
			res.setHeader('Content-Length', file.size);
		}

		const storeType = file.store.split(':').pop();
		if (settings.get(`FileUpload_S3_Proxy_${storeType}`)) {
			const request = /^https:/.test(fileUrl) ? https : http;
			const urlObj = url.parse(fileUrl);
			return FileUpload.proxyFile(
				file.name,
				{
					...options,
					...urlObj
				},
				forceDownload,
				request,
				req,
				res
			);
		}

		return FileUpload.redirectToFile(fileUrl, req, res);
	});
};

const copy = function (file, out) {
	const fileUrl = this.store.getRedirectURL(file);

	if (fileUrl) {
		const request = /^https:/.test(fileUrl) ? https : http;
		const urlObj = url.parse(fileUrl);
		request.get({ ...options, ...urlObj }, fileRes => fileRes.pipe(out));
	} else {
		out.end();
	}
};

const AmazonS3Uploads = new FileUploadClass({
	name: 'AmazonS3:Uploads',
	get,
	copy
	// store setted bellow
});

const AmazonS3Avatars = new FileUploadClass({
	name: 'AmazonS3:Avatars',
	get,
	copy
	// store setted bellow
});

const AmazonS3UserDataFiles = new FileUploadClass({
	name: 'AmazonS3:UserDataFiles',
	get,
	copy
	// store setted bellow
});

const configure = _.debounce(function () {
	const Bucket = settings.get('FileUpload_S3_Bucket');
	const Acl = settings.get('FileUpload_S3_Acl');
	const AWSAccessKeyId = settings.get('FileUpload_S3_AWSAccessKeyId');
	const AWSSecretAccessKey = settings.get('FileUpload_S3_AWSSecretAccessKey');
	const URLExpiryTimeSpan = settings.get('FileUpload_S3_URLExpiryTimeSpan');
	const Region = settings.get('FileUpload_S3_Region');
	const SignatureVersion = settings.get('FileUpload_S3_SignatureVersion');
	const ForcePathStyle = settings.get('FileUpload_S3_ForcePathStyle');
	// const CDN = RocketChat.settings.get('FileUpload_S3_CDN');
	const BucketURL = settings.get('FileUpload_S3_BucketURL');

	if (!Bucket) {
		return;
	}

	const config = {
		connection: {
			signatureVersion: SignatureVersion,
			s3ForcePathStyle: ForcePathStyle,
			params: {
				Bucket,
				ACL: Acl
			},
			region: Region
		},
		URLExpiryTimeSpan
	};

	if (AWSAccessKeyId) {
		config.connection.accessKeyId = AWSAccessKeyId;
	}

	if (AWSSecretAccessKey) {
		config.connection.secretAccessKey = AWSSecretAccessKey;
	}

	if (BucketURL) {
		config.connection.endpoint = BucketURL;
	}

	AmazonS3Uploads.store = FileUpload.configureUploadsStore(
		'AmazonS3',
		AmazonS3Uploads.name,
		config
	);
	AmazonS3Avatars.store = FileUpload.configureUploadsStore(
		'AmazonS3',
		AmazonS3Avatars.name,
		config
	);
	AmazonS3UserDataFiles.store = FileUpload.configureUploadsStore(
		'AmazonS3',
		AmazonS3UserDataFiles.name,
		config
	);
}, 500);

settings.get(/^FileUpload_S3_/, configure);
