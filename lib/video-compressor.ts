import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const loadFFmpeg = async () => {
    if (ffmpeg && ffmpeg.loaded) return ffmpeg;

    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    return ffmpeg;
};

export const compressVideo = async (
    file: File,
    onProgress?: (progress: number) => void
): Promise<File> => {
    try {
        const ext = file.name.split('.').pop()?.toLowerCase();
        // 비디오 포맷 확인 (주로 mp4, mov 압축 지원)
        if (!['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) {
            return file; // 지원되지 않는 포맷은 원본 반환
        }

        const ff = await loadFFmpeg();

        ff.on('progress', ({ progress, time }) => {
            if (onProgress) {
                // progress는 0 ~ 1 사이의 값 (일부 브라우저에선 안 맞을 수 있으므로 보정)
                onProgress(Math.max(0, Math.min(1, progress)));
            }
        });

        // 1. 메모리에 파일 쓰기
        const inputName = `input.${ext}`;
        const outputName = 'output.mp4';
        await ff.writeFile(inputName, await fetchFile(file));

        // 2. 압축 실행
        // -vcodec libx264: 가장 호환성 좋은 H.264
        // -crf 28: 품질 기준 (기본 23, 숫자가 높을수록 압축률 높고 화질 낮아짐. 28은 모바일 확인용으로 충분)
        // -preset veryfast: 인코딩 속도
        // -vf scale='min(854,iw)':-2 : 해상도 최대 너비를 854(약 480p 비율)로 조정하여 용량 급감
        await ff.exec([
            '-i', inputName,
            '-vcodec', 'libx264',
            '-crf', '28',
            '-preset', 'veryfast',
            '-vf', "scale='min(854,iw)':-2",
            outputName
        ]);

        // 3. 압축된 파일 읽기
        const data = await ff.readFile(outputName);

        // 메모리 해제
        await ff.deleteFile(inputName);
        await ff.deleteFile(outputName);

        // 결과물 반환
        // ff.readFile은 Uint8Array<ArrayBufferLike>를 반환. TypeScript DOM 라이브러리의 BlobPart 호환성을 위해 안전하게 변환.
        return new File(
            [new Uint8Array(data as any)],
            file.name.replace(/\.[^/.]+$/, "") + "_compressed.mp4",
            { type: 'video/mp4' }
        );
    } catch (err) {
        console.error("Video compression failed, returning original file:", err);
        return file; // 압축 실패 시 원본 강제 반환하여 업로드 자체는 되도록 Fallback
    }
};
