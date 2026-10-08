import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../config/themes/color_palette.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../../../injection_container.dart';

class ClubSelectionPage extends StatefulWidget {
  const ClubSelectionPage({super.key});

  @override
  State<ClubSelectionPage> createState() => _ClubSelectionPageState();
}

class _ClubSelectionPageState extends State<ClubSelectionPage> {
  final _dio = Dio(BaseOptions(baseUrl: ApiConstants.centralBaseUrl));
  List<dynamic> _clubs = [];
  List<dynamic> _filteredClubs = [];
  bool _isLoading = true;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _fetchClubs();
  }

  Future<void> _fetchClubs() async {
    try {
      final response = await _dio.get('/clubs');
      final data = response.data['clubs'] as List<dynamic>;
      setState(() {
        _clubs = data;
        _filteredClubs = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load clubs. Please check your internet connection.';
        _isLoading = false;
      });
    }
  }

  void _filterClubs(String query) {
    if (query.isEmpty) {
      setState(() => _filteredClubs = _clubs);
    } else {
      setState(() {
        _filteredClubs = _clubs
            .where((club) => club['name'].toString().toLowerCase().contains(query.toLowerCase()))
            .toList();
      });
    }
  }

  Future<void> _selectClub(dynamic club) async {
    final storage = sl<SecureStorageService>();
    await storage.saveClubBaseUrl(club['baseUrl']);
    await storage.saveClubName(club['name']);
    
    if (mounted) {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorPalette.backgroundDark,
      body: Stack(
        children: [
          // Background Effects
          _buildBackgroundEffects(),
          
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 32, left: 24, right: 24, bottom: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome to',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          color: ColorPalette.textSecondary,
                          fontWeight: 500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'GoCoach',
                        style: GoogleFonts.inter(
                          fontSize: 32,
                          color: Colors.white,
                          fontWeight: 800,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Select your sports club to continue',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          color: ColorPalette.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: TextField(
                    onChanged: _filterClubs,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Search for your club...',
                      hintStyle: const TextStyle(color: ColorPalette.textMuted),
                      prefixIcon: const Icon(Icons.search, color: ColorPalette.textSecondary),
                      filled: true,
                      fillColor: Colors.white.withValues(alpha: 0.05),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: ColorPalette.primary),
                      ),
                    ),
                  ),
                ),
                
                Expanded(
                  child: _isLoading 
                      ? const Center(child: CircularProgressIndicator(color: ColorPalette.primary))
                      : _errorMessage.isNotEmpty
                          ? Center(
                              child: Padding(
                                padding: const EdgeInsets.all(24.0),
                                child: Text(
                                  _errorMessage, 
                                  style: const TextStyle(color: ColorPalette.error),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            )
                          : _filteredClubs.isEmpty
                              ? const Center(
                                  child: Text(
                                    'No clubs found.',
                                    style: TextStyle(color: ColorPalette.textSecondary),
                                  ),
                                )
                              : ListView.builder(
                                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                                  itemCount: _filteredClubs.length,
                                  itemBuilder: (context, index) {
                                    final club = _filteredClubs[index];
                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 12),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.05),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                                      ),
                                      child: ListTile(
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                        title: Text(
                                          club['name'],
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w600,
                                            fontSize: 15,
                                          ),
                                        ),
                                        subtitle: Text(
                                          club['domain'] ?? '',
                                          style: const TextStyle(
                                            color: ColorPalette.textSecondary,
                                            fontSize: 12,
                                          ),
                                        ),
                                        trailing: const Icon(
                                          Icons.chevron_right,
                                          color: ColorPalette.primary,
                                        ),
                                        onTap: () => _selectClub(club),
                                      ),
                                    );
                                  },
                                ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackgroundEffects() {
    return Stack(
      children: [
        Positioned(
          top: -80,
          left: -60,
          child: Container(
            width: 280,
            height: 280,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: ColorPalette.primary.withValues(alpha: 0.2),
            ),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 70, sigmaY: 70),
              child: Container(color: Colors.transparent),
            ),
          ),
        ),
      ],
    );
  }
}
