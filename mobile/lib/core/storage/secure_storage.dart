import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

/// Secure token storage using flutter_secure_storage.
class SecureStorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  Future<void> saveToken(String token) async {
    await _storage.write(key: AppConstants.tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: AppConstants.tokenKey);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: AppConstants.tokenKey);
  }

  Future<bool> hasToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  // Club / Multi-Tenancy Data
  Future<void> saveClubBaseUrl(String baseUrl) async {
    await _storage.write(key: 'club_base_url', value: baseUrl);
  }

  Future<String?> getClubBaseUrl() async {
    return await _storage.read(key: 'club_base_url');
  }

  Future<void> saveClubName(String name) async {
    await _storage.write(key: 'club_name', value: name);
  }

  Future<String?> getClubName() async {
    return await _storage.read(key: 'club_name');
  }

  Future<void> clearClubData() async {
    await _storage.delete(key: 'club_base_url');
    await _storage.delete(key: 'club_name');
  }
}
