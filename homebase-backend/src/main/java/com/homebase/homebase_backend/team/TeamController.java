package com.homebase.homebase_backend.team;

import com.homebase.homebase_backend.team.dto.TeamResponseDto;
import com.homebase.homebase_backend.user.UserRepository;
import com.homebase.homebase_backend.user.dto.UserResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<TeamResponseDto>> getAll() {
        List<TeamResponseDto> result = teamRepository.findAll().stream()
                .map(t -> {
                    List<UserResponseDto> members = userRepository.findByTeam(t).stream()
                            .map(UserResponseDto::from)
                            .toList();
                    return TeamResponseDto.from(t, members);
                })
                .toList();
        return ResponseEntity.ok(result);
    }
}
